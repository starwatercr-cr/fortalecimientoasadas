// Searches the registered text, never claims OCR of scanned files.
export function normalizeAgreementText(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/(\d+(?:[.,]\d+)?)\s*(?:"|”|″|''|pulgadas?\b|pulg\.?\b|inches?\b)/g,(_,n)=>n.replace(',','.')+'pulgadas').replace(/\btuberias\b/g,'tuberia').replace(/[^a-z0-9.]+/g,' ').trim();}
export function agreementMatches(record,query){const p=record.payload||{},text=normalizeAgreementText([record.year,p.code,p.title,p.text,p.keywords,p.note,p.responsible,p.date].join(' '));return normalizeAgreementText(query).split(/\s+/).filter(Boolean).every(word=>text.includes(word));}

export const agreementProgress=state=>({'Pendiente':0,'En proceso':50,'Cumplido':100}[state]??0);
export const agreementWithProgress=r=>r.kind==='agreement'?{...r,payload:{...r.payload,progress:agreementProgress(r.payload?.state)}}:r;
