export const TOOLS=[
{id:'panel',name:'Panel de gestión',desc:'Consulte finanzas, presupuesto y acuerdos.',href:'panel-gestion.html',icon:'chart',areas:['admin','junta'],module:'panel'},
{id:'agua',name:'Nuestra agua',desc:'Revise aforos, oferta, demanda y medición.',href:'nuestra-agua.html',icon:'water',areas:['agua','junta'],module:'agua'},
{id:'bodega',name:'Proveedores y Bodega',desc:'Controle materiales, existencias y proveedores.',href:'bodega.html',icon:'box',areas:['admin','agua'],module:'bodega'},
{id:'asamblea',name:'Informes para la Asamblea',desc:'Prepare informes completos y transparentes.',href:'asamblea.html',icon:'file',areas:['junta','admin'],module:'asamblea'},
{id:'calidad',name:'Calidad de nuestra agua',desc:'Interprete resultados y dé seguimiento.',href:'calidad.html',icon:'flask',areas:['agua'],module:'calidad'},
{id:'abonados',name:'Análisis e Información de Abonados',desc:'Transforme datos de consumo en decisiones.',href:'abonados.html',icon:'chart',areas:['admin','agua'],module:'abonados'},
{id:'asada',name:'Nuestra ASADA',desc:'Datos generales, identidad y documentos.',href:'nuestra-asada.html',icon:'house',areas:['admin','junta']},
{id:'operacion',name:'Bitácora de operación',desc:'Registre labores, mediciones y pendientes.',href:'operacion.html',icon:'file',areas:['agua'],module:'operacion'},
{id:'planes',name:'Planes y seguimiento',desc:'Organice acciones, responsables y plazos.',href:'planes.html',icon:'list',areas:['admin','agua','junta'],module:'planes'},
{id:'diagnostico',name:'Diagnóstico de la ASADA',desc:'Identifique fortalezas y prioridades de mejora.',href:'diagnostico.html',icon:'list',areas:['admin','junta'],module:'diagnostico'},
{id:'equipo',name:'Nuestro equipo',desc:'Expedientes, puestos y evaluación del personal.',href:'equipo.html',icon:'users',areas:['equipo','admin'],administration:true},
{id:'morosidad',name:'Seguimiento de morosidad',desc:'Organice gestiones de cobro y compromisos.',href:'morosidad.html',icon:'chart',areas:['admin'],module:'morosidad'},
{id:'biblioteca',name:'Biblioteca para ASADAS',desc:'Busque normativa y referencias por tema.',href:'biblioteca.html',icon:'book',areas:['consulta','junta','admin','agua'],module:'biblioteca'},
{id:'minae',name:'Mapa de fuentes · MINAE',desc:'Consulte información geográfica del agua.',href:'https://mapas.da.go.cr/mapnew.php',icon:'map',areas:['consulta','agua'],external:true,module:'agua'},
{id:'registro',name:'Registro Nacional',desc:'Acceda a consultas de propiedades.',href:'https://www.rnpdigital.com/shopping/login.jspx',icon:'house',areas:['consulta','admin'],external:true}
];
export const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function allowedTools(who){return TOOLS.filter(t=>!who.external?(!t.administration||who.admin||who.role==='Administración'):Boolean(t.module)&&!t.administration&&(who.modules||[]).includes(t.module));}
export function preferenceKey(who){return 'sw-tools-v1:'+encodeURIComponent(who.email||'')+':'+(who.admin?'starwater':who.asada?.id||'');}
export function readPreferences(who,storage=globalThis.localStorage){try{const d=JSON.parse(storage.getItem(preferenceKey(who))||'{}'),valid=new Set(TOOLS.map(t=>t.id));return {favorites:[...new Set(Array.isArray(d.favorites)?d.favorites.filter(x=>valid.has(x)):[])],recent:[...new Set(Array.isArray(d.recent)?d.recent.filter(x=>valid.has(x)):[])].slice(0,8)};}catch{return {favorites:[],recent:[]};}}
export function savePreferences(who,prefs,storage=globalThis.localStorage){try{storage.setItem(preferenceKey(who),JSON.stringify(prefs));return true;}catch{return false;}}
export function rememberVisit(who,pathname,storage=globalThis.localStorage){const t=TOOLS.find(x=>!x.external&&'/'+x.href===pathname);if(!t||!allowedTools(who).some(x=>x.id===t.id))return;const p=readPreferences(who,storage);p.recent=[t.id,...p.recent.filter(x=>x!==t.id)].slice(0,8);savePreferences(who,p,storage);}
export function filterTools(who,{area='all',tab='all',search='',prefs={favorites:[],recent:[]}}={}){let list=allowedTools(who).filter(t=>(area==='all'||t.areas.includes(area))&&normalize(t.name+' '+t.desc).includes(normalize(search))&&(tab==='all'||tab==='favorites'&&prefs.favorites.includes(t.id)||tab==='recent'&&prefs.recent.includes(t.id)));if(tab==='recent')list.sort((a,b)=>prefs.recent.indexOf(a.id)-prefs.recent.indexOf(b.id));return list;}
