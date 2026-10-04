export const DEFAULTS={flow:4,users:500,consumption:14,loss:30,growth:2.5,years:15,decline:0,targetLoss:15,targetConsumption:10,improvementYear:5,newFlow:1,newYear:4};
export const LIMITS={flow:[0,1000],users:[1,1000000],consumption:[.1,500],loss:[0,95],growth:[0,15],years:[1,30],decline:[0,10],targetLoss:[0,95],targetConsumption:[0,50],improvementYear:[1,30],newFlow:[0,1000],newYear:[1,30]};
// Mes de referencia de 30 días; 1 L/s = 2.592 m³ en ese mes.
export const MONTH_FACTOR=2592;
export function projectWater(input,baseYear=2026){
 for(const [k,[min,max]] of Object.entries(LIMITS)){if(!Number.isFinite(input[k])||input[k]<min||input[k]>max)throw Error('Revise los datos y rangos del simulador.');}
 for(const k of ['users','years','improvementYear','newYear'])if(!Number.isInteger(input[k]))throw Error('Abonados y años deben ser números enteros.');
 const rows=Array.from({length:input.years+1},(_,t)=>{const users=Math.ceil(Number((input.users*(1+input.growth/100)**t).toFixed(8))),produced=input.flow*(1-input.decline/100)**t,progress=Math.min(1,t/input.improvementYear),loss=input.loss+(input.targetLoss-input.loss)*progress,consumption=input.consumption*(1-input.targetConsumption/100*progress),newFlow=t>=input.newYear?input.newFlow:0;const demand=users*input.consumption,available=produced*MONTH_FACTOR*(1-input.loss/100),plannedDemand=users*consumption,plannedAvailable=(produced+newFlow)*MONTH_FACTOR*(1-loss/100);return {t,year:baseYear+t,users,produced,demand,available,balance:available-demand,loss,consumption,newFlow,plannedDemand,plannedAvailable,plannedBalance:plannedAvailable-plannedDemand};});
 return {rows,firstDeficit:rows.find(r=>r.balance<0)||null,plannedDeficit:rows.find(r=>r.plannedBalance<0)||null,last:rows.at(-1),today:rows[0]};
}
