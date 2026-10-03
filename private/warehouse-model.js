export function stockStatus(stock,minimum){if(stock===0)return {key:'empty',label:'Agotado',order:0};if(stock<=minimum)return {key:'low',label:'Solicitar reposición',order:1};return {key:'ok',label:'Disponible',order:2};}
export function warehouseView(records,moves,filter={}){
 const text=String(filter.search||'').toLocaleLowerCase('es'),byId=new Map(records.map(r=>[r.id,r]));
 const match=r=>!text||Object.values(r.payload).some(v=>String(v).toLocaleLowerCase('es').includes(text));
 const suppliers=records.filter(r=>r.kind==='supplier'&&(filter.inactive||!r.archived)&&match(r));
 const items=records.filter(r=>r.kind==='item'&&(filter.inactive||!r.archived)&&match(r)&&(!filter.category||r.payload.category===filter.category)).map(r=>({...r,stock:Number(r.stock),status:stockStatus(Number(r.stock),r.payload.minimum),supplierName:byId.get(r.payload.supplier)?.payload.name||'',supplierInactive:!!byId.get(r.payload.supplier)?.archived,suggested:Math.max(0,Math.round((r.payload.target-Number(r.stock))*1000)/1000)})).filter(r=>!filter.state||r.status.key===filter.state).sort((a,b)=>a.status.order-b.status.order||a.payload.name.localeCompare(b.payload.name,'es'));
 const ledger=moves.filter(m=>(!filter.start||m.date>=filter.start)&&(!filter.end||m.date<=filter.end)&&(!filter.item||m.item_id===filter.item)).map(m=>({...m,quantity:Number(m.quantity),balance:Number(m.balance),item:byId.get(m.item_id)?.payload||{code:'',name:'Material',unit:''},supplierName:byId.get(m.supplier_id)?.payload.name||''})).filter(m=>!text||[m.item.name,m.item.code,m.reason,m.responsible,m.reference].some(v=>String(v).toLocaleLowerCase('es').includes(text))).sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id));
 return {items,suppliers,moves:ledger,reorder:items.filter(r=>!r.archived&&r.status.key!=='ok'),byId};
}
export function warehouseExportRows(view){return [
 view.items.map(r=>{const p=r.payload;return [p.code,p.name,p.category,p.unit,r.stock,p.minimum,p.target,r.status.label,p.location,r.supplierName+(r.supplierInactive?' (inactivo)':''),p.specs,r.archived?'Inactivo':'Activo',p.note];}),
 view.reorder.map(r=>[r.payload.code,r.payload.name,r.payload.unit,r.stock,r.payload.minimum,r.payload.target,r.suggested,r.supplierName]),
 view.suppliers.map(r=>{const p=r.payload;return [p.name,p.legal,p.tax,p.contact,p.phone,p.email,p.category,p.terms,p.delivery,p.quality,r.archived?'Inactivo':'Activo',p.note];}),
 view.moves.map(m=>[new Date(m.date+'T00:00:00Z'),m.item.code,m.item.name,m.type==='in'?'Entrada':m.type==='out'?'Salida':'Ajuste',m.quantity,m.item.unit,m.balance,m.responsible,m.reason,m.reference,m.supplierName,new Date(m.created_at),m.id])];}
