import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const src=readFileSync(new URL('../public/analytics-public.js',import.meta.url),'utf8');
function init({page='/tienda/ak410.html',choice=null,hostname='solucionesstarwater.com',gpc=false}={}) {
  const calls=[], listeners={}, elements=[], saved={sw_analytics_choice_v1:choice};
  let reloaded=0;
  const doc={title:'Star Water',referrer:'https://www.google.com/search?q=private',cookie:'',currentScript:{dataset:{page}},
    createElement(type) {
      const el={type,hidden:false,children:[],listeners:{},dataset:{},append(x){this.children.push(x);},setAttribute(){},focus(){},
        addEventListener(n,f){this.listeners[n]=f;},querySelector(){return {focus(){},disabled:false,textContent:''};}};
      elements.push(el);return el;
    },
    body:{append(){}},head:{append(el){calls.push(el.src);}},querySelector(){return null;},
    addEventListener(n,f){listeners[n]=f;}
  };
  const win={};
  const ctx={document:doc,window:win,location:{hostname,href:'https://'+hostname+page+'?private=123#private',reload(){reloaded++;}},navigator:{globalPrivacyControl:gpc},localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},URL,Date};
  vm.runInNewContext(src,ctx);
  const choose=value=>elements.find(el=>el.className==='sw-analytics-consent').listeners.click({target:{closest:()=>({dataset:{consent:value}})}});
  const click=(href,cls='')=>listeners.click({target:{closest:()=>({href,closest:()=>null,classList:{contains:n=>n===cls}})}});
  const events=()=>Array.from(win.dataLayer||[],arg=>Array.from(arg)).filter(arg=>arg[0]==='event');
  return {calls,win,events,click,choose,saved,reloads:()=>reloaded};
}
test('no Google tag or events before consent or after rejection',()=>{
  const a=init();assert.equal(a.calls.length,0);a.click('https://wa.me/50673006172');assert.equal(a.events().length,0);
  a.choose('declined');assert.equal(a.calls.length,0);assert.equal(a.events().length,0);
});
test('opt-in loads exactly one tag and records product interest without raw link or URL parameters',()=>{
  const a=init();a.choose('accepted');a.choose('accepted');
  assert.equal(a.calls.length,1);assert.match(a.calls[0],/G-02NHVYKH57$/);
  a.click('https://wa.me/50673006172?text=private', 'sw-consulta');
  assert.deepEqual(a.events().map(e=>e[1]),['page_view','view_item','clic_whatsapp','clic_cotizacion']);
  const data=JSON.stringify(a.win.dataLayer);assert.ok(!data.includes('private'));assert.ok(!data.includes('50673006172'));
  assert.match(data,/ak410/);a.choose('declined');assert.equal(a.win['ga-disable-G-02NHVYKH57'],true);assert.equal(a.reloads(),1);
  const previous=a.events().length;a.click('https://wa.me/50673006172');assert.equal(a.events().length,previous);
});
test('consented visitors track commercial intentions, not booking or submission completion',()=>{
  const a=init({page:'/deteccion-de-fugas',choice:'accepted'});a.click('https://solucionesstarwater.com/deteccion-de-fugas#reservar');
  assert.deepEqual(a.events().map(e=>e[1]),['page_view','clic_agenda_fugas']);
  const b=init({page:'/plataforma',choice:'accepted'});b.click('https://solucionesstarwater.com/acceso?prueba=registro');b.click('https://calendar.app.google/example');
  assert.deepEqual(b.events().map(e=>e[1]),['page_view','clic_prueba_asadas','clic_asesoria']);
});
test('no Google tag on preview hosts or when global privacy control is enabled',()=>{
  assert.equal(init({hostname:'example.netlify.app',choice:'accepted'}).calls.length,0);
  assert.equal(init({gpc:true,choice:'accepted'}).calls.length,0);
});
