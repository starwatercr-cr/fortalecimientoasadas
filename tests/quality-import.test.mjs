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

test('el tipo del PDF se infiere también cuando el navegador informa octet-stream',async()=>{
 assert.equal(waterAnalysisType({name:'analisis.pdf',type:'application/octet-stream'}),'application/pdf');
 assert.equal(waterAnalysisType({name:'foto.jpg',type:''}),'image/jpeg');
 await assert.rejects(readWaterAnalysis({name:'vacio.pdf',type:'application/pdf',size:0}),/hasta 5 MB/);
 await assert.rejects(readWaterAnalysis({name:'grande.pdf',type:'application/pdf',size:5*1024*1024+1}),/hasta 5 MB/);
});
