import {flowComment, flowSeries} from './aforos-model.js';
import {arrearsView, buckets} from './morosidad-model.js';
import {warehouseView} from './warehouse-model.js';
import './financial-home-model.js';

const cutoff = '2026-09-30';
const sources = [
  {id: 'loma', kind: 'source', payload: {name: 'Naciente Loma Verde', includeTotal: true}},
  {id: 'bosque', kind: 'source', payload: {name: 'Naciente El Bosque', includeTotal: true}},
];
const campaigns = [
  ['2026-03-18', 'Verano', 4.2, 2.6],
  ['2026-05-20', 'Transición', 4.8, 3.0],
  ['2026-09-16', 'Invierno', 5.6, 3.4],
];
const flows = [...sources, ...campaigns.flatMap(([date, campaign, ...rates]) =>
  sources.map(({id}, i) => ({
    id: id + date, source_id: id, kind: 'measurement',
    payload: {date, flow: rates[i], campaign},
  })))];

const debts = [
  ['DEMO-001', 'Centro', 'F-1041', '2026-06-15', 28450],
  ['DEMO-002', 'Loma Verde', 'F-1162', '2026-07-15', 19100],
  ['DEMO-003', 'Centro', 'F-1266', '2026-08-20', 12300],
  ['DEMO-004', 'El Bosque', 'F-1350', '2026-09-22', 8750],
  ['DEMO-005', 'El Bosque', 'F-1381', '2026-10-06', 9350],
].map(([code, sector, invoice, due, balance]) => ({
  kind: 'debt', payload: {code, sector, invoice, due, balance, cutoff},
}));
const suppliers = [
  {id: 'hidro', kind: 'supplier', payload: {name: 'Hidráulica Ejemplo', category: 'Tubería y accesorios', delivery: '3 días hábiles'}},
  {id: 'insumos', kind: 'supplier', payload: {name: 'Insumos Ejemplo', category: 'Operación y tratamiento', delivery: '5 días hábiles'}},
];
const materials = [
  ['MAT-01', 'Tubo PVC 50 mm', 'Tubería', 'tramos', 32, 10, 40, 'hidro'],
  ['MAT-02', 'Unión PVC 50 mm', 'Accesorios', 'unidades', 4, 8, 20, 'hidro'],
  ['MAT-03', 'Válvula de paso 50 mm', 'Accesorios', 'unidades', 0, 2, 6, 'hidro'],
  ['MAT-04', 'Reactivo DPD para cloro libre', 'Calidad del agua', 'unidades', 120, 30, 150, 'insumos'],
].map(([code, name, category, unit, stock, minimum, target, supplier]) => ({
  id: code, kind: 'item', stock, payload: {code, name, category, unit, minimum, target, supplier},
}));

const statements = {
  2025: {date: '2025-09-30', cash: 7150000, receivables: 875000, fixed: 28450000, other: 75000, liabilities: 3250000, equity: 33300000, income: 16240000, expenses: 13890000},
  2026: {date: cutoff, cash: 8450000, receivables: 910000, fixed: 30400000, other: 90000, liabilities: 3650000, equity: 36200000, income: 17950000, expenses: 14920000},
};
const documents = [
  ['Acta de Junta Directiva', 'Acta ficticia JD-09-2026. En sesión del 24 de setiembre de 2026, la Junta acuerda cotizar 16 uniones y 6 válvulas de paso de 50 mm. La administración presentará cotizaciones para revisión en la próxima sesión.'],
  ['Informe de aforos', 'Campaña ficticia del 16 de setiembre de 2026. Naciente Loma Verde: 5,6 L/s. Naciente El Bosque: 3,4 L/s. Caudal conjunto observado: 9,0 L/s. Se comparan los resultados con las campañas de marzo y mayo.'],
  ['Orden de mantenimiento', 'Orden ficticia OT-14-2026. Inspeccionar la válvula del sector Centro y verificar el inventario de repuestos antes de programar el trabajo. Responsable: equipo de operación de ASADA Ejemplo.'],
];

const el = id => document.getElementById(id);
const currency = new Intl.NumberFormat('es-CR', {style: 'currency', currency: 'CRC', maximumFractionDigits: 0});
const money = value => currency.format(value);
const decimal = value => value.toLocaleString('es-CR', {maximumFractionDigits: 2});
function node(tag, text) {
  const item = document.createElement(tag);
  item.textContent = text;
  return item;
}

function table(target, headers, rows) {
  if (!rows.length) {
    el(target).replaceChildren(node('p', 'El filtro no tiene registros de ejemplo.'));
    return;
  }
  const grid = document.createElement('table');
  const heading = grid.createTHead().insertRow();
  for (const label of headers) {
    const th = node('th', label);
    th.scope = 'col';
    heading.append(th);
  }
  const body = grid.createTBody();
  for (const values of rows) {
    const row = body.insertRow();
    for (const value of values) row.insertCell().textContent = value;
  }
  el(target).replaceChildren(grid);
}

function renderFinance() {
  const year = el('periodo').value;
  const statement = statements[year];
  const report = globalThis.SWFinancialHome.build([{kind: 'statement', payload: statement}], year);
  el('resumen-finanzas').textContent = 'Resultado al 30 de setiembre: ' + money(report.result);
  table('tabla-finanzas', ['Concepto', 'Monto'], [
    ['Ingresos acumulados', report.income], ['Gastos acumulados', report.expenses],
    ['Efectivo y equivalentes', report.cash], ['Cuentas por cobrar', report.receivables],
    ['Activos', report.assets], ['Pasivos', report.liabilities], ['Patrimonio', report.equity],
  ].map(([name, value]) => [name, money(value)]));
}

function renderFlows() {
  const source = el('fuente').value;
  const {points} = flowSeries(flows, {source, general: source === ''});
  el('resumen-aforos').textContent = flowComment(points);
  table('tabla-aforos', ['Fecha', 'Campaña', 'Caudal (L/s)'],
    points.map(row => [row.date, row.campaign, decimal(row.flow)]));
}

function renderDebts() {
  const report = arrearsView(debts, cutoff, {band: el('antiguedad').value});
  el('resumen-morosidad').textContent = 'Saldo del filtro: ' + money(report.total) + ' · Vencido: ' + money(report.overdue);
  table('tabla-morosidad', ['Abonado de ejemplo', 'Sector', 'Factura', 'Vencimiento', 'Días vencidos', 'Saldo'],
    report.debts.map(({payload: p, days}) => [p.code, p.sector, p.invoice, p.due, days, money(p.balance)]));
}

function renderWarehouse() {
  const view = warehouseView([...suppliers, ...materials], [], {state: el('existencias').value});
  table('tabla-materiales', ['Material', 'Existencia', 'Mínimo', 'Estado', 'Reposición sugerida', 'Proveedor'],
    view.items.map(({payload: p, stock, status, suggested, supplierName}) =>
      [p.name, stock + ' ' + p.unit, p.minimum, status.label, status.key === 'ok' ? '—' : suggested, supplierName]));
  table('tabla-proveedores', ['Proveedor ficticio', 'Categoría', 'Entrega estimada'],
    view.suppliers.map(({payload: p}) => [p.name, p.category, p.delivery]));
}

function bindFilter(id, options, render) {
  const select = el(id);
  if (options) select.append(...options);
  select.addEventListener('change', render);
  render();
}

bindFilter('periodo', [new Option('Enero a setiembre de 2026', '2026'), new Option('Enero a setiembre de 2025', '2025')], renderFinance);
bindFilter('fuente', [new Option('Caudal conjunto', ''), ...sources.map(({id, payload}) => new Option(payload.name, id))], renderFlows);
bindFilter('antiguedad', [new Option('Todos los saldos', ''), ...buckets.map((label, index) => new Option(label, String(index)))], renderDebts);
bindFilter('existencias', null, renderWarehouse);

for (const [title, text] of documents) {
  const row = document.createElement('li');
  const button = node('button', 'Descargar PDF');
  button.type = 'button';
  button.className = 'button outline';
  button.setAttribute('aria-label', 'Descargar PDF: ' + title);
  button.addEventListener('click', () => {
    if (!globalThis.jspdf?.jsPDF) {
      el('estado-documento').textContent = 'No se pudo preparar el PDF. Recargue esta página e inténtelo de nuevo.';
      return;
    }
    const pdf = new globalThis.jspdf.jsPDF();
    pdf.setFontSize(17);
    pdf.text('ASADA Ejemplo', 20, 24);
    pdf.setFontSize(12);
    pdf.text('DOCUMENTO FICTICIO · PARA DEMOSTRACIÓN', 20, 34);
    pdf.setFontSize(15);
    pdf.text(title, 20, 50);
    pdf.setFontSize(11);
    pdf.text(pdf.splitTextToSize(text, 170), 20, 62);
    pdf.save('ASADA-Ejemplo-' + title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll(' ', '-') + '.pdf');
  });
  row.append(title + ' ', button);
  el('lista-documentos').append(row);
}
