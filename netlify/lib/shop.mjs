export async function shopAPI(api,request,{sb,owner,body,json,PublicError,storage}){
 const base='/rest/v1/shop_products';
 if(api==='shop-public'&&request.method==='GET')return json(await sb(base+'?published=eq.true&select=*&order=name.asc'));
 await owner();
 if(api==='shop-list'&&request.method==='GET')return json(await sb(base+'?select=*&order=name.asc'));
 if(api==='shop-save'&&request.method==='POST'){
 const x=await body(request);
 const str=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
 const name=str(x.name,200),slug=str(x.slug,200),category=str(x.category,30);
 if(!name||! /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)||!['medicion','dosificacion','filtracion','almacenamiento','tuberias'].includes(category))throw new PublicError(400,'Revise nombre, código y categoría.');
 const price=x.price_crc==null||x.price_crc===''?null:Number(x.price_crc),stock=x.stock==null||x.stock===''?null:Number(x.stock);
 if(price!==null&&(!Number.isFinite(price)||price<0)||stock!==null&&(!Number.isInteger(stock)||stock<0))throw new PublicError(400,'Revise precio y existencias.');
 const valid=p=>typeof p==='string'&&/^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/.test(p);
 const images=Array.isArray(x.images)?x.images.filter(p=>valid(p)&&!p.endsWith('.pdf')).slice(0,8):[];
 const pdf=valid(x.technical_pdf)&&x.technical_pdf.endsWith('.pdf')?x.technical_pdf:null;
 const data={name,slug,category,description:str(x.description,12000),specifications:str(x.specifications,20000),price_crc:price,stock,images,technical_pdf:pdf,published:x.published===true,updated_at:new Date().toISOString()};
 if(x.id){if(!/^[a-f0-9-]{36}$/.test(x.id))throw new PublicError(400,'Identificador inválido.');return json(await sb(base+'?id=eq.'+x.id,{method:'PATCH',body:data,prefer:'return=representation'}));}
 return json(await sb(base,{method:'POST',body:data,prefer:'return=representation'}));
 }
 if(api==='shop-upload'&&request.method==='POST'){
 const x=await body(request),ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'})[x.type];
 if(!ext)throw new PublicError(400,'Formato no permitido.');
 const path=crypto.randomUUID()+'.'+ext;
 return json({path,...await storage('SIGN_UPLOAD',path)});
 }
 throw new PublicError(404,'Operación no disponible.');
}
