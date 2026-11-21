import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const gateway=readFileSync('netlify/functions/gateway.mjs','utf8');
const redirects=readFileSync('netlify.toml','utf8');
const fileList=gateway.match(/const protectedFiles=new Set\(\[([\s\S]*?)\]\)/)?.[1];
assert.ok(fileList,'La lista de archivos privados debe estar presente');
const protectedFiles=new Set([...fileList.matchAll(/'([^']+)'/g)].map(m=>m[1]));

test('los generadores PDF y sus dependencias privadas tienen ruta autorizada',()=>{
 const pages=['contabilidad','diagnostico','disponibilidades','abonados','anc','planes','aforos','equipo','operacion','panel-gestion','nuestra-asada','bodega','morosidad'];
 const scripts=new Set(['assets/jspdf.umd.min.js','assets/diagnostic-fonts.js']);
 for(const page of pages){
  const html=readFileSync('private/'+page+'.html','utf8');
  assert.match(html,/pdf|PDF/i,page+' debe ofrecer un documento');
  for(const [,src] of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)){
   const path=src.split('?')[0].replace(/^\//,'');
   if(protectedFiles.has(path))scripts.add(path);
  }
 }
 for(const name of [...scripts]){
  if(!name.endsWith('.js'))continue;
  const source=readFileSync('private/'+name,'utf8');
  for(const [,dep] of source.matchAll(/\bimport\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']/g)){
   if(dep.startsWith('./'))scripts.add(dep.slice(2).split('?')[0]);
  }
 }
 for(const name of scripts){
  assert.ok(existsSync('private/'+name),name+' debe estar incluido en el despliegue privado');
  assert.ok(protectedFiles.has(name),name+' debe requerir sesión');
  assert.ok(redirects.includes('from = "/'+name+'"'),name+' debe llegar al servidor privado');
 }
});

test('los botones que abren impresión explican cómo guardar el PDF',()=>{
 for(const [page,id] of [['equipo','team-pdf'],['operacion','ops-pdf'],['panel-gestion','sw-pdf'],['nuestra-asada','profile-pdf'],['morosidad','ar-pdf']]){
  const html=readFileSync('private/'+page+'.html','utf8');
  assert.match(html,new RegExp('<button[^>]*id="'+id+'"[^>]*>Imprimir o guardar[^<]*PDF</button>'),page);
 }
});
