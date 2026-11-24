
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildSubscriberPDF} from '../private/abonados-export.js';
import {buildAvailabilityPDF} from '../private/availability-export.js';
import {buildAncPDF} from '../private/anc-export.js';
function pdfContext(){
 const c={console,TextEncoder,TextDecoder,atob,btoa,navigator:{userAgent:'node'}};c.window=c;c.self=c;vm.createContext(c);
 for(const f of ['jspdf.umd.min.js','diagnostic-fonts.js'])vm.runInContext(fs.readFileSync('private/assets/'+f,'utf8'),c);
 const Original=c.jspdf.jsPDF,lines=[],cards=[];
 const wrapper=function(opts){const doc=new Original(opts),text=doc.text.bind(doc),rounded=doc.roundedRect.bind(doc);
 doc.text=(s,x,y,o)=>{for(const l of (Array.isArray(s)?s:[s]))lines.push({s:l,x,y,page:doc.internal.getCurrentPageInfo().pageNumber,width:doc.getTextWidth(l),size:doc.getFontSize(),align:o?.align});return text(s,x,y,o);};
 doc.roundedRect=(x,y,w,h,...args)=>{cards.push({x,y,w,h,page:doc.internal.getCurrentPageInfo().pageNumber});return rounded(x,y,w,h,...args);};return doc;};
 c.jspdf={jsPDF:wrapper};c.SWLetterhead={load:async()=>{},pdf:()=>0};return {c,lines,cards};
}
test('Abonados: cifras extensas quedan dentro de sus tarjetas en PDF real',()=>{
 const {c,lines,cards}=pdfContext();globalThis.window=c;try{
 const d=buildSubscriberPDF({name:'ASADA de prueba',scope:'Período de prueba',filenames:[],threshold:30,increase:20,category:'',subscriber:'',comments:[],analysis:{metrics:{subscribers:999999,consumption:987654321.45,billedCount:1,billed:1234567890123.45},months:[],rising:[]},rows:[],view:'Todos'});
 assert.equal(d.output('arraybuffer').byteLength>5000,true);assert.equal(cards.length,4);
 for(const card of cards){const contents=lines.filter(l=>l.page===card.page&&l.x===card.x+3&&l.y>=card.y&&l.y<=card.y+card.h);assert(contents.length>=2);for(const l of contents)assert(l.x+l.width<=card.x+card.w-2+0.1,'Texto desborda tarjeta: '+l.s);}
 }finally{delete globalThis.window;}
});
test('Disponibilidad: firma, cargo y ASADA permanecen juntos aunque el oficio sea extenso',async()=>{
 const {c,lines}=pdfContext();globalThis.window=c;try{
 const report={draft:true,date:'23/11/2026',office:'Oficio de prueba',addressee:'Persona solicitante',paragraphs:Array.from({length:27},()=> 'Texto de prueba para comprobar la distribución y los saltos de página.'),status:[],validity:'Vigencia de prueba',closing:'Atentamente',signer:'Firmante de prueba',role:'Cargo de prueba',name:'ASADA de prueba'};
 const d=await buildAvailabilityPDF(report);assert(d.getNumberOfPages()>1);
 const sign=lines.find(l=>l.s==='________________________________________'),role=lines.find(l=>l.s===report.role),name=lines.find(l=>l.s===report.name);
 assert(sign&&role&&name);assert.equal(sign.page,role.page);assert.equal(role.page,name.page);assert(name.y<247);
 for(let i=1;i<=d.getNumberOfPages();i++)assert(lines.some(l=>l.page===i&&l.s===i+' / '+d.getNumberOfPages()));
 }finally{delete globalThis.window;}
});
test('ANC: leyenda y numeración completas en informe de varias páginas',()=>{
 const {c,lines}=pdfContext();globalThis.window=c;try{
 const r={status:'Resultado revisado',entry:10000,exit:0,storageDelta:0,available:10000,billed:7000,anc:3000,residual:2800,pct:30,coverage:100,payload:{period:'2026-10',start:'2026-10-01',end:'2026-11-01',responsible:'Persona de prueba',authorizedUnbilled:200,macros:[],sourceLabel:'Manual',note:''}};
 const d=buildAncPDF(r,'ASADA de prueba',Array.from({length:50},(_,i)=>'Observación de prueba '+i));assert(d.getNumberOfPages()>1);
 assert(lines.some(l=>l.s.startsWith('Facturado autorizado:')&&l.size===9));assert(lines.some(l=>l.s.startsWith('Remanente por investigar:')&&l.size===9));
 for(let i=1;i<=d.getNumberOfPages();i++)assert(lines.some(l=>l.page===i&&l.s===i+' / '+d.getNumberOfPages()));
 }finally{delete globalThis.window;}
});
