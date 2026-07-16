export function formatPhone(value:string){const d=value.replace(/\D/g,"").slice(0,11);if(d.length<=2)return d;if(d.length<=6)return "("+d.slice(0,2)+") "+d.slice(2);if(d.length<=10)return "("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6);return "("+d.slice(0,2)+") "+d.slice(2,7)+"-"+d.slice(7);}
export const bytes=(n:number)=>n<1024*1024?Math.ceil(n/1024)+" KB":(n/1024/1024).toFixed(1)+" MB";
