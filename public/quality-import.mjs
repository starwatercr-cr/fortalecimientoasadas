const aliases=[
 ['ecoli',/^(?:escherichia\s+coli|e\.?\s*coli)\b/i],
 ['fecal',/^coliformes?\s+(?:fecales|termotolerantes)\b/i],
 ['total',/^coliformes?\s+totales\b/i],
 ['chlorine',/^cloro\s+residual\s+libre\b/i],
 ['combined',/^cloro\s+residual\s+combinado\b/i],
 ['turbidity',/^(?:turbiedad|turbidez)\b/i],
 ['ph',/^p\s*\.?\s*h\b/i],
 ['color',/^color\s+(?:aparente|verdadero)\b/i],
 ['conductivity',/^conductividad(?:\s+electrica)?\b/i],
 ['temperature',/^temperatura\b/i],
 ['odor',/^olor\b/i],
 ['iron',/^hierro(?:\s+total)?\b/i],
 ['manganese',/^manganeso(?:\s+total)?\b/i],
 ['nitrate',/^nitrato(?:s)?(?:\s+como\s+no3)?\b/i],
 ['nitrite',/^nitrito(?:s)?(?:\s+como\s+no2)?\b/i],
 ['arsenic',/^arsenico\b/i],
 ['lead',/^plomo\b/i],
 ['fluoride',/^fluoruro(?:s)?\b/i],
 ['hardness',/^dureza\s+total\b/i],
 ['chloride',/^cloruro(?:s)?\b/i],
 ['sulfate',/^sulfato(?:s)?\b/i],
 ['aluminium',/^aluminio\b/i],
 ['ammonium',/^amonio\b/i]
];
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
function unitFor(id,text){
 if(['ecoli','fecal','total'].includes(id)){const m=text.match(/\b(NMP|UFC)\s*\/\s*100\s*m[lL]\b/i);return m?m[1].toUpperCase()+'/100 mL':'';}
 if(id==='ph')return 'pH';
 if(id==='odor')return 'Cualitativo';
 if(id==='temperature')return /(?:°|º)\s*C\b/i.test(text)?'°C':'';
 if(id==='turbidity'){const m=text.match(/\b(?:UNT|NTU)\b/i);return m?m[0].toUpperCase():'';}
 if(id==='color')return /(?:U\s*[- ]?Pt\s*[- ]?Co|UPC|UC)\b/i.test(text)?'U-Pt-Co':'';
 if(id==='conductivity')return /[µμu]S\s*\/\s*cm\b/i.test(text)?'µS/cm':'';
 const m=text.match(/(\bmg|[µμu]g)\s*\/\s*[lL]\b/i);return m?(m[1].toLowerCase()==='mg'?'mg/L':'µg/L'):'';
}
function valueFor(id,tail,unit){
 let t=tail.replace(/\b(?:NMP|UFC)\s*\/\s*100\s*m[lL]\b/gi,' ').replace(/(?:\bmg|[µμu]g)\s*\/\s*[lL]\b/gi,' ').replace(/\b(?:UNT|NTU|UPC)\b/gi,' ').replace(/\bU\s*[- ]?Pt\s*[- ]?Co\b/gi,' ').replace(/(?:°|º)\s*C\b/gi,' ').replace(/[µμu]S\s*\/\s*cm\b/gi,' ').trim();
 if(id==='odor'){if(/\bno\s+aceptable\b/i.test(t))return 'no aceptable';if(/\baceptable\b/i.test(t))return 'aceptable';return '';}
 const hit=t.match(/(?:^|\s|[:|;])\s*(no\s+detectable|no\s+detectado|ausencia|ausente|N\.?D\.?|presente|positivo|negativo|(?:<|>|≤|≥)\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(?=\s|$|[;|])/i);
 if(!hit)return '';
 let v=hit[1].trim();
 if(/^(?:no\s+detect|ausen|N\.?D|negativo)/i.test(v))v='ND';
 else if(/^(?:positivo|presente)/i.test(v))v='presente';
 return v;
}
function contextFrom(lines){
 const text=lines.map(l=>l.text).join('\n'),n=normalize(text).toLowerCase();
 const treated=/(?:agua\s+(?:tratada|potable|de\s+red)|red\s+de\s+distribucion|salida\s+del\s+tanque)/.test(n),raw=/(?:agua\s+(?:cruda|sin\s+tratamiento)|naciente\s+sin\s+tratamiento|fuente\s+sin\s+tratamiento)/.test(n);
 const stage=treated&&!raw?'treated':raw&&!treated?'raw':'unknown';
 const origin=/\b(?:pozo|naciente|subterranea)\b/.test(n)&&!/\b(?:rio|quebrada|superficial)\b/.test(n)?'groundwater':/\b(?:rio|quebrada|superficial)\b/.test(n)&&!/\b(?:pozo|naciente|subterranea)\b/.test(n)?'surface':'unknown';
 const dateLine=lines.find(l=>/fecha\s+(?:de\s+)?(?:toma|muestreo|recoleccion)/i.test(normalize(l.text)))?.text||'';
 const dm=dateLine.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](20\d{2})\b/),iso=dateLine.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
 const date=iso?iso[0]:dm?dm[3]+'-'+dm[2].padStart(2,'0')+'-'+dm[1].padStart(2,'0'):'';
 const report=lines.find(l=>/\b(?:n(?:o|°|º)\.?\s*de\s+)?(?:informe|reporte)\s*(?:n(?:o|°|º))?\b/i.test(l.text))?.text.slice(0,100)||'';
 const lab=lines.find(l=>/\blaboratorio\s*:/i.test(l.text))?.text.slice(0,150)||'';
 return {name:'',sample:'',date,lab,report,stage,origin,disinfection:/(?:cloramina|cloro\s+combinado)/.test(n)?'combined':'unknown',temperature:'',};
}
export function extractWaterAnalysis(lines,params){
 const known=new Set(params.map(p=>p.id)),rows=[],warnings=[],seen=new Map();
 for(const line of lines){
  const raw=String(line.text||'').replace(/\s+/g,' ').trim(),n=normalize(raw).replace(/^\d+[.)]\s*/,'');if(!raw)continue;
  const found=aliases.find(([id,re])=>known.has(id)&&re.test(n));
  if(!found)continue;
  const [id,re]=found,tail=n.replace(re,'').trim(),unit=unitFor(id,raw),value=valueFor(id,tail,unit);
  if(!unit||!value){warnings.push('No se pudo leer con seguridad '+found[0]+' (página '+line.page+').');continue;}
  const row={param:id,value,unit,ld:'',source:raw.slice(0,110),page:line.page};
  if(seen.has(id)){seen.get(id).duplicate=true;warnings.push('El parámetro '+id+' aparece más de una vez; puede haber varias muestras. Se dejó sin comparación automática.');}
  else{seen.set(id,row);rows.push(row);}
 }
 const unique=rows.some(r=>r.duplicate)?[]:rows.map(({duplicate,...r})=>r),context=contextFrom(lines);
 if(context.stage==='unknown')warnings.push('No se pudo confirmar si la muestra corresponde a agua tratada o sin tratamiento. La comparación quedará pendiente.');
 if(!context.date)warnings.push('No se identificó con certeza la fecha de toma de muestra.');
 return {context,rows:unique,warnings:[...new Set(warnings)].slice(0,20)};
}
function pdfLines(items,page){
 const groups=[];for(const x of items.filter(x=>x.str?.trim()).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){
  let g=groups.find(g=>Math.abs(g.y-x.transform[5])<3);if(!g){g={y:x.transform[5],parts:[]};groups.push(g);}g.parts.push(x);
 }
 return groups.map(g=>({page,text:g.parts.sort((a,b)=>a.transform[4]-b.transform[4]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim()})).filter(l=>l.text);
}
async function makeOCR(progress){
 if(!window.Tesseract)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/vendor/abonados/tesseract.min.js';script.onload=resolve;script.onerror=()=>reject(Error('No se pudo cargar el lector de imágenes.'));document.head.append(script);});
 return window.Tesseract.createWorker('spa',1,{workerPath:'/vendor/abonados/worker.min.js',corePath:'/vendor/abonados/tesseract-core-lstm.wasm.js',langPath:'/vendor/abonados',gzip:false,workerBlobURL:false,logger:m=>progress('Leyendo imagen · '+Math.round((m.progress||0)*100)+' %')});
}
export function waterAnalysisType(file){
 const inferred={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png'}[file.name.split('.').at(-1).toLowerCase()]||'';
 return !file.type||file.type==='application/octet-stream'?inferred:file.type;
}
export async function readWaterAnalysis(file,progress=()=>{}){
 if(!file||!file.size||file.size>5*1024*1024)throw Error('Use un PDF, JPG o PNG de hasta 5 MB.');
 const type=waterAnalysisType(file),lines=[];let worker=null,ocr=false;
 try{
  if(type==='application/pdf'){
   const pdfjs=await import('/vendor/abonados/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='/vendor/abonados/pdf.worker.min.mjs';
   const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true,standardFontDataUrl:'/vendor/abonados/standard_fonts/'}).promise;
   try{if(pdf.numPages>12)throw Error('El análisis debe tener como máximo 12 páginas.');
    for(let i=1;i<=pdf.numPages;i++){
     progress('Leyendo página '+i+' de '+pdf.numPages+'…');const page=await pdf.getPage(i),text=await page.getTextContent();
     const readable=pdfLines(text.items,i);
     if(readable.some(l=>aliases.some(([,re])=>re.test(normalize(l.text)))))lines.push(...readable);
     else{
      ocr=true;if(!worker)worker=await makeOCR(progress);
      const viewport=page.getViewport({scale:1.8});if(viewport.width*viewport.height>16e6)throw Error('La imagen del PDF es demasiado grande.');
      const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
      const result=await worker.recognize(canvas);lines.push(...result.data.text.split('\n').filter(Boolean).map(text=>({page:i,text})));canvas.width=canvas.height=0;
     }page.cleanup();
    }
   }finally{await pdf.destroy();}
  }else if(['image/jpeg','image/png'].includes(type)){
   ocr=true;worker=await makeOCR(progress);const result=await worker.recognize(file);
   lines.push(...result.data.text.split('\n').filter(Boolean).map(text=>({page:1,text})));
  }else throw Error('Use PDF, JPG o PNG.');
  return {lines,ocr};
 }finally{if(worker)await worker.terminate();}
}
