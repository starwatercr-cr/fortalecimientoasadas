const cutoff = '2026-09-30';
const sources = [
  {id: 'loma', kind: 'source', payload: {name: 'Naciente Loma Verde', type: 'Naciente', location: 'Sector de ejemplo', includeTotal: true}},
  {id: 'bosque', kind: 'source', payload: {name: 'Naciente El Bosque', type: 'Naciente', location: 'Sector de ejemplo', includeTotal: true}},
];
const campaigns = [
  ['2025-03-19', 'Verano', 3.9, 2.4],
  ['2025-09-17', 'Invierno', 5.2, 3.1],
  ['2026-03-18', 'Verano', 4.2, 2.6],
  ['2026-05-20', 'Transición', 4.8, 3.0],
  ['2026-09-16', 'Invierno', 5.6, 3.4],
];
const flows = [...sources, ...campaigns.flatMap(([date, campaign, ...rates]) =>
  sources.map(({id}, i) => ({
    id: id + date, source_id: id, kind: 'measurement',
    payload: {date, flow: rates[i], season: campaign, campaign: 'Aforo de ' + campaign.toLowerCase(), method: 'Volumétrico', responsible: 'Equipo de ejemplo'},
  })))];

const cases = [
  {id: 'demo-001', kind: 'subscriber', payload: {code: 'DEMO-001', name: 'Abonado de ejemplo 01', sector: 'Centro', state: 'En seguimiento', nextDate: '2026-09-25', responsible: 'Administración de ejemplo', reason: 'Factura F-1041 con saldo de ₡28 450.'}},
  {id: 'demo-002', kind: 'subscriber', payload: {code: 'DEMO-002', name: 'Abonado de ejemplo 02', sector: 'Loma Verde', state: 'Compromiso de pago', responsible: 'Administración de ejemplo', reason: 'Factura F-1162 con saldo de ₡19 100.'}},
  {id: 'demo-003', kind: 'subscriber', payload: {code: 'DEMO-003', name: 'Abonado de ejemplo 03', sector: 'El Bosque', state: 'Resuelto', reason: 'Saldo cancelado.'}},
  {id: 'demo-contact', kind: 'collection', parent_id: 'demo-001', payload: {date: '2026-09-18', channel: 'Teléfono', result: 'Se informó el saldo pendiente.', next: 'Revisar si se recibió el pago.', nextDate: '2026-09-25'}},
  {id: 'demo-promise', kind: 'promise', parent_id: 'demo-002', payload: {date: '2026-09-24', due: '2026-10-07', state: 'Pendiente', amount: 19100, note: 'La persona abonada se comprometió a pagar el saldo completo.'}},
];
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

const movements = [
  {id: 'm-1', type: 'in', item_id: 'MAT-02', supplier_id: 'hidro', date: '2026-09-10', created_at: '2026-09-10T14:00:00Z', quantity: 20, balance: 20, responsible: 'Bodega de ejemplo', reason: 'Compra para reparación', reference: 'OC-DEMO-03'},
  {id: 'm-2', type: 'out', item_id: 'MAT-02', date: '2026-09-22', created_at: '2026-09-22T14:00:00Z', quantity: 16, balance: 4, responsible: 'Operación de ejemplo', reason: 'Reparación en el sector Centro', reference: 'OT-DEMO-12'},
];

const statements = {
  2025: {date: '2025-09-30', cash: 7150000, receivables: 875000, fixed: 28450000, other: 75000, liabilities: 3250000, equity: 33300000, income: 16240000, expenses: 13890000},
  2026: {date: cutoff, cash: 8450000, receivables: 910000, fixed: 30400000, other: 90000, liabilities: 3650000, equity: 36200000, income: 17950000, expenses: 14920000},
};
const documents = [
  ['Acta de Junta Directiva', 'Acta ficticia JD-09-2026. En sesión del 24 de setiembre de 2026, la Junta acuerda cotizar 16 uniones y 6 válvulas de paso de 50 mm. La administración presentará cotizaciones para revisión en la próxima sesión.'],
  ['Informe de aforos', 'Campaña ficticia del 16 de setiembre de 2026. Naciente Loma Verde: 5,6 L/s. Naciente El Bosque: 3,4 L/s. Caudal conjunto observado: 9,0 L/s. Se comparan los resultados con las campañas de marzo y mayo.'],
  ['Orden de mantenimiento', 'Orden ficticia OT-14-2026. Inspeccionar la válvula del sector Centro y verificar el inventario de repuestos antes de programar el trabajo. Responsable: equipo de operación de ASADA Ejemplo.'],
];


const exampleAsada = {id: 'ejemplo', name: 'ASADA Ejemplo · Datos ficticios'};

export function exampleData(route) {
  const [resource, search] = route.split('?');
  switch (resource) {
    case 'flow-asadas':
    case 'panel-asadas':
      return {asadas: [exampleAsada], canEdit: false, canManage: false};
    case 'flow-data':
      return {asada: exampleAsada, records: flows, canEdit: false, canManage: false};
    case 'warehouse-data':
      return {asada: exampleAsada, records: [...suppliers, ...materials], moves: movements, canManage: false, canMove: false, loadedAt: cutoff};
    case 'arrears-data':
      return {asada: exampleAsada, records: cases, canEdit: false};
    case 'panel-data': {
      const year = new URLSearchParams(search).get('year');
      const statement = Object.hasOwn(statements, year) ? statements[year] : null;
      return {asada: exampleAsada, records: statement ? [{kind: 'statement', payload: statement}] : []};
    }
    default:
      throw Error('Esta acción está disponible en los datos de su ASADA.');
  }
}

export function showExampleDocuments(container) {
  const list = document.createElement('ul');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  for (const [title, text] of documents) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button outline';
    button.textContent = 'Descargar PDF';
    button.setAttribute('aria-label', 'Descargar PDF de ' + title);
    button.onclick = () => {
      if (!globalThis.jspdf?.jsPDF) {
        status.textContent = 'El PDF no está disponible. Recargue la página e inténtelo de nuevo.';
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
    };
    row.append(title + ' ', button);
    list.append(row);
  }
  container.append(list, status);
  container.hidden = false;
}
