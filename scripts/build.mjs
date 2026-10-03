import {cp,rm} from 'node:fs/promises';
import path from 'node:path';
import {checkClientSyntax} from './check-client-syntax.mjs';
await checkClientSyntax();
await rm('build',{recursive:true,force:true});
const oldAccess=new Set(['activar.html','cuenta.html','administrar.html','portal-session.js']);
await cp('public','build',{recursive:true,filter:src=>!oldAccess.has(path.basename(src))});
console.log('Archivos públicos preparados. Las herramientas se sirven con autorización.');
