import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extractWaterAnalysis,waterAnalysisType,readWaterAnalysis} from '../public/quality-import.mjs';
import {QUALITY_PARAMS,qualityReport} from '../private/water-parameters.js';

test('un informe PDF con valores, unidades y fecha genera resultados interpretables',()=>{
 const lines=['Laboratorio: Pruebas','Agua tratada - red de distribución','Fecha de toma de muestra: 20/11/2026','Turbidez 1,2 UNT','Cloro residual libre 0,6 mg/L','pH 7,3','Escherichia coli ND NMP/100 mL'].map(text=>({page:1,text}));
 const extracted=extractWaterAnalysis(lines,QUALITY_PARAMS);
 assert.equal(extracted.context.date,'2026-11-20');
 assert.equal(extracted.context.stage,'treated');
 assert.deepEqual(extracted.rows.map(({param,value,unit})=>({param,value,unit})),[
  {param:'turbidity',value:'1,2',unit:'UNT'},
  {param:'chlorine',value:'0,6',unit:'mg/L'},
  {param:'ph',value:'7,3',unit:'pH'},
  {param:'ecoli',value:'ND',unit:'NMP/100 mL'}
 ]);
 assert.equal(qualityReport(extracted.rows,extracted.context).results.length,4);
});

test('unidades ausentes y muestras duplicadas no producen comparaciones engañosas',()=>{
 const lines=['Agua tratada','Turbidez 1,2','Turbidez 1,3 UNT','Turbidez 2,1 UNT'].map(text=>({page:1,text}));
 const result=extractWaterAnalysis(lines,QUALITY_PARAMS);
 assert.equal(result.rows.length,0);
 assert.ok(result.warnings.some(w=>w.includes('más de una vez')));
 assert.ok(result.warnings.some(w=>w.includes('No se pudo leer')));
});

test('tabla de laboratorio con asteriscos e incertidumbre conserva el resultado, no el límite',()=>{
 const lines=[
  'Punto de muestreo Agua tomada de la Naciente El Congo de la llave de Chorro.',
  'Fecha de muestreo: 19/05/2025',
  '* Color aparente (5 ± 1) U Pt-Co SMWW 2120 B 2 U Pt-Co 15 UPt-Co Cumple',
  '* Conductividad (76 ± 6) uS/cm SMWW 2510 B 1 uS/cm',
  '* Olor Aceptable MTDT-42 Aceptable Cumple',
  '* pH (7,21 ± 0,06) SMWW 4500-H+ B 1 6 a 8 Cumple',
  '* Turbiedad < 0,1 UNT SMWW 2130 B 0,1 UNT 5 UNT Cumple',
  'Reglamento para la Calidad del Agua Potable',
  'Temperatura: 16°C','Cloro residual libre: 0,40 mg/L'
 ].map(text=>({page:1,text}));
 const result=extractWaterAnalysis(lines,QUALITY_PARAMS);
 assert.deepEqual(result.rows.map(({param,value})=>[param,value]),[
  ['color','5'],['conductivity','76'],['odor','aceptable'],['ph','7,21'],['turbidity','< 0,1'],['temperature','16'],['chlorine','0,40']
 ]);
 assert.equal(result.context.stage,'unknown');
 assert.equal(result.context.date,'2025-05-19');
 assert.match(result.context.sample,/Naciente El Congo/);
 assert.ok(qualityReport(result.rows,result.context).results.every(r=>r.status==='pending'));
});

test('el tipo del PDF se infiere también cuando el navegador informa octet-stream',async()=>{
 assert.equal(waterAnalysisType({name:'analisis.pdf',type:'application/octet-stream'}),'application/pdf');
 assert.equal(waterAnalysisType({name:'foto.jpg',type:''}),'image/jpeg');
 await assert.rejects(readWaterAnalysis({name:'vacio.pdf',type:'application/pdf',size:0}),/hasta 5 MB/);
 await assert.rejects(readWaterAnalysis({name:'grande.pdf',type:'application/pdf',size:5*1024*1024+1}),/hasta 5 MB/);
});
