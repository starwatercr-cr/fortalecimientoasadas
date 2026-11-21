const form=document.getElementById('intake');
const kind=form.elements.kind;
const message=document.getElementById('message');
const button=document.getElementById('submit');
const selected=new URLSearchParams(location.search).get('tipo');
if (Array.from(kind.options).some(option=>option.value===selected)) kind.value=selected;
function showFields(){
  for (const section of form.querySelectorAll('[data-kind]')) {
    section.disabled=section.hidden=section.dataset.kind!==kind.value;
  }
}
kind.addEventListener('change',showFields);
showFields();
button.disabled=false;
let id=crypto.randomUUID();
form.addEventListener('input',()=>{ if (!button.disabled) id=crypto.randomUUID(); });
form.addEventListener('submit',async event=>{
  event.preventDefault();
  button.disabled=true;
  message.textContent='Enviando consulta…';
  try {
    const data=new FormData(form);
    const file=data.get('file');
    data.delete('file');
    const input={...Object.fromEntries(data),id,accept:form.elements.accept.checked};
    if(file?.size){
      if(file.size>2097152) throw Error('El archivo debe pesar como máximo 2 MB.');
      input.attachment=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(String(reader.result).split(',')[1]);
        reader.onerror=()=>reject(Error('No pudimos leer el archivo.'));
        reader.readAsDataURL(file);
      });
      input.attachmentType=file.type;
    }
    const response=await fetch('/api/client-request-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    const result=await response.json();
    if(!response.ok) throw Error(result.error||'No pudimos registrar la consulta.');
    form.hidden=true;
    message.textContent='';
    document.getElementById('case').textContent=result.id;
    const receipt=document.getElementById('receipt');
    receipt.hidden=false;
    receipt.focus();
  } catch(error){
    message.textContent=error.message||'No pudimos registrar la consulta. Intente de nuevo.';
    button.disabled=false;
  }
});
