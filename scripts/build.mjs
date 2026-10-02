import {cp,rm} from 'node:fs/promises';
await rm('build',{recursive:true,force:true});
await cp('public','build',{recursive:true});
console.log('Archivos públicos preparados. Las herramientas se sirven con autorización.');
