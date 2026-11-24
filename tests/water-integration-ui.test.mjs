import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
test('Nuestra agua contiene todos los controles referenciados por las integraciones',()=>{
 const html=readFileSync('private/nuestra-agua.html','utf8'),js=readFileSync('private/agua.js','utf8');
 const ids=new Set([...js.matchAll(/el\('(water-(?:flow|demand|anc)-[\w-]+)'\)/g)].map(m=>m[1]));
 assert.ok(ids.size>=15);
 for(const id of ids)assert.equal([...html.matchAll(new RegExp('id="'+id+'"','g'))].length,1,id);
});
test('Los módulos modificados tienen sintaxis JavaScript válida',()=>{
 for(const path of ['agua','plans','plans-export','diagnostic','decision-center','asamblea']){
  const r=spawnSync(process.execPath,['--check','--input-type=module'],{input:readFileSync('private/'+path+'.js','utf8'),encoding:'utf8'});
  assert.equal(r.status,0,path+': '+r.stderr);
 }
});
