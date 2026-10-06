export function computeWater(d){
 const valid=n=>Number.isFinite(n)&&n>=0;
 const supply=d.flows.length&&d.flows.every(valid)?d.flows.reduce((a,b)=>a+b,0)*86.4*d.days:null;
 const demand=valid(d.connections)&&d.connections>0&&valid(d.average)&&d.average>0&&valid(d.loss)&&d.loss<=95?d.connections*d.average*d.days/30/(1-d.loss/100):null;
 const scenarioSupply=supply===null?null:supply*(1-d.reduction/100);
 const scenarioDemand=demand===null?null:(d.connections+d.added)*d.average*d.days/30/(1-Math.max(0,d.loss-d.improvement)/100);
 const difference=valid(d.input)&&valid(d.recorded)?d.input-d.recorded:null;
 return {supply,demand,scenarioSupply,scenarioDemand,margin:supply===null||demand===null?null:supply-demand,scenarioMargin:scenarioSupply===null||scenarioDemand===null?null:scenarioSupply-scenarioDemand,difference,percent:difference===null||d.input===0?null:difference/d.input*100};
}
