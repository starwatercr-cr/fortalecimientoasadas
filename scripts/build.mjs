import {cp,rm} from 'node:fs/promises';
import path from 'node:path';
await rm('build',{recursive:true,force:true});
const oldAccess=new Set(['activar.html','cuenta.html','administrar.html','portal-session.js']);
await cp('public','build',{recursive:true,filter:src=>!oldAccess.has(path.basename(src))});
console.log('Archivos públicos preparados. Las herramientas se sirven con autorización.');
