import test from 'node:test';
import assert from 'node:assert/strict';
import {externalAllowed,ACCESS_MODULES} from '../netlify/lib/access.mjs';

test('Acceso externo sin módulos: deniega datos privados y archivos sensibles',()=>{
 const who={external:true,modules:[]};
 for(const resource of ['panel-data','team-data','access-list','profile-file','arrears-data','warehouse-data','flow-data'])
  assert.equal(externalAllowed(who,resource,true,'GET'),false,resource);
 for(const resource of ['equipo.html','accesos.html','contabilidad.html','panel-gestion.html'])
  assert.equal(externalAllowed(who,resource,false,'GET'),false,resource);
});

test('Acceso externo con todos los módulos: no concede escritura de registros',()=>{
 const who={external:true,modules:Object.keys(ACCESS_MODULES)};
 for(const resource of ['panel-save','flow-save','ops-save','access-create','warehouse-move','arrears-save','plans-save','availability-save'])
  for(const method of ['POST','PUT','PATCH','DELETE'])
   assert.equal(externalAllowed(who,resource,true,method),false,resource+' '+method);
});

test('Acceso externo: un módulo no habilita datos de otro módulo',()=>{
 for(const [module,allowed,denied] of [
  ['agua','flow-data','arrears-data'],
  ['bodega','warehouse-data','team-data'],
  ['morosidad','arrears-data','flow-data'],
  ['abonados','abonados-data','panel-data'],
  ['planes','plans-data','access-list']
 ]){
  const who={external:true,modules:[module]};
  assert.equal(externalAllowed(who,allowed,true),true,allowed);
  assert.equal(externalAllowed(who,denied,true),false,denied);
 }
});
