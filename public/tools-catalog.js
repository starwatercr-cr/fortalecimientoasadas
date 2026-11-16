export const AREAS=[{"id": "finanzas", "name": "Finanzas", "icon": "chart"}, {"id": "agua", "name": "Agua y operación", "icon": "water"}, {"id": "cobros", "name": "Abonados y cobros", "icon": "users"}, {"id": "junta", "name": "Junta Directiva y planificación", "icon": "target"}, {"id": "consulta", "name": "Organización y consultas", "icon": "book"}];
export const TOOLS=[
{id:'panel',name:'Resumen financiero',desc:'Consulte saldos, resultados y gráficos del año.',href:'panel-gestion.html',view:'home',icon:'chart',areas:['finanzas'],module:'panel'},
{id:'estados',name:'Estados financieros',desc:'Revise los cierres y compare dos años.',href:'panel-gestion.html',view:'statements',icon:'file',areas:['finanzas'],module:'panel'},
{id:'presupuesto',name:'Presupuesto de la ASADA',desc:'Revise lo previsto y lo ejecutado.',href:'panel-gestion.html',view:'budget',icon:'target',areas:['finanzas'],module:'panel'},
{id:'flujo',name:'Flujo de efectivo',desc:'Consulte las entradas, salidas y saldos.',href:'panel-gestion.html',view:'cash',icon:'flow',areas:['finanzas'],module:'panel'},
{id:'caja',name:'Caja chica',desc:'Registre gastos menores y controle el fondo.',href:'panel-gestion.html',view:'petty',icon:'wallet',areas:['finanzas'],module:'panel'},
{id:'activos',name:'Auxiliar de activos',desc:'Consulte el registro de activos.',href:'panel-gestion.html',view:'assets',icon:'box',areas:['finanzas'],module:'panel'},
{id:'agua',name:'Nuestra agua',desc:'Revise aforos, oferta, demanda y medición.',href:'nuestra-agua.html',icon:'water',areas:['agua'],module:'agua'},
{id:'calidad',name:'Calidad de nuestra agua',desc:'Interprete resultados y dé seguimiento.',href:'calidad.html',icon:'flask',areas:['agua'],module:'calidad'},
{id:'operacion',name:'Bitácora de operación',desc:'Registre labores, mediciones y pendientes.',href:'operacion.html',icon:'check',areas:['agua'],module:'operacion'},
{id:'bodega',name:'Proveeduría',desc:'Controle materiales, existencias y proveedores.',href:'bodega.html',icon:'box',areas:['agua'],module:'bodega'},
{id:'orders',name:'Órdenes de trabajo',desc:'Asigne reparaciones y dé seguimiento a cada labor.',href:'panel-gestion.html',view:'orders',icon:'check',areas:['agua'],module:'panel'},
{id:'outages',name:'Interrupciones del servicio',desc:'Registre sectores afectados y restablecimiento.',href:'panel-gestion.html',view:'outages',icon:'clock',areas:['agua'],module:'panel'},
{id:'network',name:'Mapa del acueducto',desc:'Ubique la infraestructura y sus puntos críticos.',href:'panel-gestion.html',view:'network',icon:'map',areas:['agua'],module:'panel'},
{id:'proyectos',name:'Portafolio de proyectos',desc:'Prepare perfiles con estudios, presupuesto, avances y respaldos para la Junta o financiadores.',href:'panel-gestion.html',view:'projects',icon:'target',areas:['junta'],module:'panel'},
{id:'calendar',name:'Calendario de obligaciones',desc:'Vea fechas propias, acuerdos y planes por vencer.',href:'panel-gestion.html',view:'calendar',icon:'calendar',areas:['junta'],module:'panel'},
{id:'monthly',name:'Informe mensual para la Junta',desc:'Reúna finanzas, trabajos, servicio y calidad en un PDF.',href:'panel-gestion.html',view:'monthly',icon:'file',areas:['junta'],module:'panel'},
{id:'minae',name:'Mapa de fuentes · MINAE',desc:'Consulte información geográfica del agua.',href:'https://mapas.da.go.cr/mapnew.php',icon:'map',areas:['agua'],external:true,module:'agua'},
{id:'abonados',name:'Análisis e Información de Abonados',desc:'Transforme datos de consumo en decisiones.',href:'abonados.html',icon:'users',areas:['cobros'],module:'abonados'},
{id:'morosidad',name:'Seguimiento de morosidad',desc:'Organice gestiones de cobro y compromisos.',href:'morosidad.html',icon:'clock',areas:['cobros'],module:'morosidad'},
{id:'pagos',name:'Acuerdos de pago',desc:'Revise los compromisos de pago para la Junta Directiva.',href:'panel-gestion.html',view:'payments',icon:'wallet',areas:['cobros'],module:'panel'},
{id:'diagnostico',name:'Diagnóstico de la ASADA',desc:'Identifique fortalezas y prioridades de mejora.',href:'diagnostico.html',icon:'target',areas:['junta'],module:'diagnostico'},
{id:'acuerdos',name:'Acuerdos de Junta Directiva',desc:'Busque acuerdos y dé seguimiento a sus plazos.',href:'panel-gestion.html',view:'board',icon:'check',areas:['junta'],module:'panel'},
{id:'plan-junta',name:'Plan de trabajo de la Junta Directiva',desc:'Revise las acciones, responsables y fechas de la Junta.',href:'panel-gestion.html',view:'workplan',icon:'calendar',areas:['junta'],module:'panel'},
{id:'planes',name:'Planes y seguimiento',desc:'Organice acciones, responsables y plazos.',href:'planes.html',icon:'calendar',areas:['junta'],module:'planes'},
{id:'asamblea',name:'Informes para la Asamblea',desc:'Prepare informes completos y transparentes.',href:'asamblea.html',icon:'file',areas:['junta'],module:'asamblea'},
{id:'asada',name:'Nuestra ASADA',desc:'Datos generales, identidad y documentos.',href:'nuestra-asada.html',icon:'house',areas:['consulta']},
{id:'equipo',name:'Nuestro equipo',desc:'Expedientes, puestos y evaluación del personal.',href:'equipo.html',icon:'users',areas:['consulta'],administration:true},
 {id:'plan-administracion',name:'Plan de trabajo de Administración',desc:'Organice las actividades por semana, quincena o mes.',href:'panel-gestion.html',view:'workplan',planArea:'administracion',icon:'calendar',areas:['consulta'],module:'panel'},
{id:'biblioteca',name:'Biblioteca para ASADAS',desc:'Busque normativa y referencias por tema.',href:'biblioteca.html',icon:'book',areas:['consulta'],module:'biblioteca'},
{id:'registro',name:'Registro Nacional',desc:'Acceda a consultas de propiedades.',href:'https://www.rnpdigital.com/shopping/login.jspx',icon:'map',areas:['consulta'],external:true}
];
export const toolHref=t=>t.href+(t.view?'?module='+t.view+'&from=herramientas'+(t.planArea?'&planArea='+encodeURIComponent(t.planArea):''):'');
export const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function allowedTools(who){return TOOLS.filter(t=>!who.external?(!t.administration||who.admin||who.role==='Administración'):Boolean(t.module)&&!t.administration&&(who.modules||[]).includes(t.module));}
export function preferenceKey(who){return 'sw-tools-v1:'+encodeURIComponent(who.email||'')+':'+(who.admin?'starwater':who.asada?.id||'');}
export function readPreferences(who,storage=globalThis.localStorage){try{const d=JSON.parse(storage.getItem(preferenceKey(who))||'{}'),valid=new Set(TOOLS.map(t=>t.id));return {favorites:[...new Set(Array.isArray(d.favorites)?d.favorites.map(x=>x==='nuestras-finanzas'?'panel':x).filter(x=>valid.has(x)):[])],recent:[...new Set(Array.isArray(d.recent)?d.recent.map(x=>x==='nuestras-finanzas'?'panel':x).filter(x=>valid.has(x)):[])].slice(0,8)};}catch{return {favorites:[],recent:[]};}}
export function savePreferences(who,prefs,storage=globalThis.localStorage){try{storage.setItem(preferenceKey(who),JSON.stringify(prefs));return true;}catch{return false;}}
export function rememberVisit(who,pathname,storage=globalThis.localStorage,query=''){const params=new URLSearchParams(query),key=params.get('module');const view=!key||key==='finance-summary'?'home':key;const t=TOOLS.find(x=>!x.external&&'/'+x.href===pathname&&(!x.view||x.view===view)&&(x.planArea||null)===(params.get('planArea')==='administracion'?'administracion':null));if(!t||!allowedTools(who).some(x=>x.id===t.id))return;const p=readPreferences(who,storage);p.recent=[t.id,...p.recent.filter(x=>x!==t.id)].slice(0,8);savePreferences(who,p,storage);}
export function filterTools(who,{area='all',tab='all',search='',prefs={favorites:[],recent:[]}}={}){let list=allowedTools(who).filter(t=>(area==='all'||t.areas.includes(area))&&normalize(t.name+' '+t.desc).includes(normalize(search))&&(tab==='all'||tab==='favorites'&&prefs.favorites.includes(t.id)||tab==='recent'&&prefs.recent.includes(t.id)));if(tab==='recent')list.sort((a,b)=>prefs.recent.indexOf(a.id)-prefs.recent.indexOf(b.id));return list;}
