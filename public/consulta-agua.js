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
    const attachmentFields=[['file','attachment'],['measurementsFile','attachment'],['planFile','sourcePlan']];
    const files=[];
    for(const [field,key] of attachmentFields){
      const file=data.get(field);
      data.delete(field);
      if(file?.size) files.push({file,key});
    }
    if(files.some(({file})=>file.size>2097152) || files.reduce((total,{file})=>total+file.size,0)>3145728){
      throw Error('Adjunte hasta 2 MB por archivo y 3 MB en total.');
    }
    const input={...Object.fromEntries(data),id,accept:form.elements.accept.checked};
    for(const {file,key} of files){
      input[key]=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(String(reader.result).split(',')[1]);
        reader.onerror=()=>reject(Error('No pudimos leer el archivo.'));
        reader.readAsDataURL(file);
      });
      input[key+'Type']=file.type;
    }
    const response=await fetch('/api/client-request-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    const result=await response.json();
    if(!response.ok) throw Error(result.error||'No pudimos registrar la consulta.');
    form.hidden=true;
    message.textContent='';
    document.getElementById('case').textContent=result.caseNumber||result.id;
    const receipt=document.getElementById('receipt');
    receipt.hidden=false;
    receipt.focus();
  } catch(error){
    message.textContent=error.message||'No pudimos registrar la consulta. Intente de nuevo.';
    button.disabled=false;
  }
});
