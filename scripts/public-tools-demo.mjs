import { writeFile } from 'node:fs/promises';
import { AREAS, TOOLS } from '../public/tools-catalog.js';

const examples = {
 contabilidad:['Asiento 014','Compra de materiales · ₡85.000'],
 panel:['Resultado del mes','₡3.800.000 ingresos · ₡2.950.000 gastos'],
 estados:['Comparación de cierres','Activos: ₡41.800.000 → ₡45.200.000'],
 presupuesto:['Mantenimiento de red','₡420.000 ejecutados de ₡600.000'],
 flujo:['Saldo al cierre','₡1.250.000 inicial + ₡860.000 entradas − ₡520.000 salidas'],
 caja:['Fondo disponible','₡100.000 iniciales − ₡28.500 en comprobantes'],
 activos:['Activo 008','Bomba auxiliar · En servicio'],
 agua:['Sector de demostración','Oferta: 8,0 L/s · Demanda: 6,4 L/s'],
 calidad:['Muestra DEMO-01','Resultado cargado · Pendiente de revisión'],
 operacion:['Ronda del martes','Tanque inspeccionado · Lectura registrada'],
 bodega:['Uniones de PVC','12 unidades en inventario · Mínimo: 10'],
 orders:['Orden DEMO-021','Reparación de válvula · En curso'],
 outages:['Interrupción programada','Sector de demostración · 9:00 a. m. a 11:00 a. m.'],
 network:['Tramo DEMO-07','220 m de tubería · Una válvula registrada'],
 proyectos:['Renovación de tubería','Etapa: diseño · Avance: 40 %'],
 calendar:['Entrega de informe','Revisión interna · 15 de abril'],
 monthly:['Informe de gestión','Tres avances · Dos decisiones pendientes'],
 minae:['Consulta de ejemplo','Punto ficticio mostrado como referencia documental'],
 abonados:['Resumen del padrón','486 servicios activos · 14 inactivos'],
 morosidad:['Cartera pendiente','₡325.000 · 18 cuentas por revisar'],
 pagos:['Acuerdo DEMO-003','₡90.000 divididos en tres cuotas'],
 diagnostico:['Resultado de diagnóstico','Operación: 78/100 · Prioridad: documentar controles'],
 acuerdos:['Acuerdo DEMO-004','Revisar cotizaciones · Pendiente'],
 'plan-junta':['Meta trimestral','Revisar el plan de inversiones · En curso'],
 planes:['Plan de mantenimiento','Cuatro de seis tareas completadas'],
 asamblea:['Informe de tesorería','Borrador con el cierre y notas de respaldo'],
 asada:['Ficha institucional','Organización de demostración · Perfil de contacto'],
 equipo:['Perfil de puesto','Operación · Capacitación programada'],
 'plan-administracion':['Tarea de administración','Actualizar inventario · Responsable: Administración'],
 biblioteca:['Guía de trabajo','Modelo de acta · Documento de ejemplo'],
 registro:['Consulta de referencia','Búsqueda ilustrativa por número de finca, sin datos registrales reales']
};
const highlighted = new Set(['presupuesto','agua','morosidad','acuerdos','equipo']);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderPublicToolsDemo() {
 if (TOOLS.some(tool => !examples[tool.id]) || TOOLS.length !== Object.keys(examples).length) {
  throw new Error('Cada herramienta del catálogo público necesita un ejemplo ficticio.');
 }
 const sections = AREAS.map(({ id, name }, index) => {
  const tools = TOOLS.filter(tool => tool.areas.includes(id));
  const featured = tools.find(tool => highlighted.has(tool.id));
  const number = String(index + 1).padStart(2, '0');
  return `<section class="area" id="${escape(id)}" aria-labelledby="title-${escape(id)}">
    <header class="area-title"><span class="index" aria-hidden="true">${number}</span><h2 id="title-${escape(id)}">${escape(name)}</h2><span class="count">${tools.length} herramientas</span></header>
    <div class="area-content">
      ${featured ? `<aside class="preview" aria-label="Vista ilustrativa de ${escape(featured.name)}">
        <p class="preview-label">Vista ilustrativa · Datos ficticios</p>
        <h3>${escape(featured.name)}</h3>
        <div class="sample"><strong>${escape(examples[featured.id][0])}</strong><p>${escape(examples[featured.id][1])}</p>
        ${featured.id === 'presupuesto' ? '<label for="sample-budget">Ejecución del presupuesto · 70 %</label><progress id="sample-budget" value="70" max="100">70 %</progress>' : ''}</div>
      </aside>` : ''}
      <div class="tool-list">
        ${tools.map(tool => `<details class="tool" data-demo-tool="${escape(tool.id)}">
          <summary><span>${escape(tool.name)}</span></summary>
          <div class="tool-detail"><p>${escape(tool.desc)}</p><p class="detail-example"><strong>Ejemplo ficticio · ${escape(examples[tool.id][0])}</strong><br>${escape(examples[tool.id][1])}</p></div>
        </details>`).join('')}
      </div>
    </div>
  </section>`;
 }).join('');
 return `<!doctype html>
<html lang="es-CR">
<head>
 <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
 <title>Catálogo de herramientas para ASADAS | Star Water</title>
 <meta name="description" content="Explore las herramientas de Star Water para ASADAS con ejemplos ficticios. Finanzas, operación, cobros, Junta Directiva y administración.">
 <link rel="canonical" href="https://solucionesstarwater.com/catalogo-herramientas">
 <link rel="stylesheet" href="/catalogo-herramientas.css">
</head>
<body>
 <a class="skip" href="#contenido">Ir al contenido</a>
 <header class="top"><div class="wrap nav">
  <a href="/" class="brand" aria-label="Star Water, inicio"><img src="/assets/logo.png" width="452" height="128" alt="Star Water"></a>
  <a class="login" href="/acceso">Ingresar a la plataforma</a>
 </div></header>
 <main id="contenido">
  <section class="hero"><div class="wrap hero-inner">
   <a class="back" href="/plataforma">← Volver a Plataforma para ASADAS</a>
   <div class="hero-copy">
    <p class="eyebrow">STAR WATER <span>·</span> PLATAFORMA PARA ASADAS</p>
    <h1>Explore todas las herramientas</h1>
    <p class="intro">Vea cómo su equipo puede organizar los cobros, revisar el presupuesto y llevar el control del acueducto en un solo lugar.</p>
    <p class="disclaimer"><strong>Vista pública con datos ficticios.</strong> No requiere iniciar sesión ni muestra información de ninguna ASADA. Las herramientas operativas siguen disponibles solo dentro de la plataforma.</p>
   </div>
  </div></section>
  <div class="wrap body-wrap">
   <nav class="areas-nav" aria-label="Áreas del catálogo">${AREAS.map(({id,name})=>`<a href="#${escape(id)}">${escape(name)}</a>`).join('')}</nav>
   <p class="browse-tip">Seleccione una herramienta para leer qué hace y ver un ejemplo.</p>
   ${sections}
   <section class="bottom" aria-labelledby="try-title">
    <div><h2 id="try-title">¿Quiere probar la plataforma?</h2><p>Solicite su prueba de 5 días o ingrese si ya tiene una cuenta.</p></div>
    <a class="trial" href="/acceso?prueba=registro">Solicitar prueba de 5 días</a>
   </section>
  </div>
 </main>
 <footer class="wrap">Star Water Ingeniería · Costa Rica</footer>
</body></html>
`;
}

export async function writePublicToolsDemo(dir = 'build') {
 await writeFile(`${dir}/catalogo-herramientas.html`, renderPublicToolsDemo());
}
