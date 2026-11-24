import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {protectedFiles} from '../netlify/functions/gateway.mjs';

test('enlaces HTML internos de herramientas privadas apuntan a destinos existentes',()=>{
 const failures=[];
 for(const name of fs.readdirSync('private').filter(n=>n.endsWith('.html'))){
  const html=fs.readFileSync('private/'+name,'utf8');
  for(const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)){
   const href=match[1];
   if(!/^\/?[\w-]+\.html(?:[?#]|$)/i.test(href))continue;
   const target=href.split(/[?#]/)[0].replace(/^\//,'');
   if(fs.existsSync('private/'+target)){
    if(!protectedFiles.has(target))failures.push(name+' → '+target+' (sin protección)');
   }else if(!fs.existsSync('build/'+target)){
    failures.push(name+' → '+target+' (destino no disponible)');
   }
  }
 }
 assert.deepEqual(failures,[]);
});
