import {cp,readdir,readFile,rm,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {checkClientSyntax} from './check-client-syntax.mjs';
await checkClientSyntax();
await rm('build',{recursive:true,force:true});
const oldAccess=new Set(['activar.html','cuenta.html','administrar.html','portal-session.js']);
await cp('public','build',{recursive:true,filter:src=>!oldAccess.has(path.basename(src))});
// Normalize the shared marketing menu on older pages as part of the public build.
async function updateProgramMenu(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){await updateProgramMenu(file);continue;}
  if(!entry.isFile()||!entry.name.endsWith('.html'))continue;
  const html=await readFile(file,'utf8');
  const normalized=html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi,menu=>menu.replace(/(<a\b[^>]*\bhref=(["'])(?:\/programa|(?:\.\.\/)*programa\.html)\2[^>]*>)El programa<\/a>\s*<a\b[^>]*\bhref=(["'])(?:\/ejes-desarrollo|(?:\.\.\/)*ejes-desarrollo\.html)\3[^>]*>Ejes de desarrollo<\/a>/gi,'$1Programa</a>'));
  const updated=normalized.replace(/<nav\b[^>]*\bid=(["'])nav-links\1[^>]*>[\s\S]*?<\/nav>/gi,menu=>{
   menu=menu.replace(/<a\b[^>]*\bhref=(["'])(?:\/|(?:\.\.\/)*index\.html)?#inversion\1[^>]*>Precios<\/a>/gi,'');
   menu=menu.replace(/<a\b[^>]*>Agendar sesión<\/a>/gi,'');
   if(menu.includes('/deteccion-de-fugas'))return menu;
   return menu.replace(/<a\b[^>]*\bhref=(["'])(?:\/programa|(?:\.\.\/)*programa\.html)\1[^>]*>Programa<\/a>/i,match=>match+'<a href="/deteccion-de-fugas">Detección de fugas</a>');
  });
  if(updated!==html)await writeFile(file,updated);
 }
}
await updateProgramMenu('build');
console.log('Archivos públicos preparados. Las herramientas se sirven con autorización.');
