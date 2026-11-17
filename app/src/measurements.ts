/** Presentation only. Canonical storage and API contracts stay in millimeters. */
export const isDimension=(key:string)=>/_mm$/.test(key);
export function inchesInput(mm:unknown):string {
 if(mm===null||mm===undefined||mm==='')return '';
 return String(Number((Number(mm)/25.4).toFixed(8)));
}
export function formatInches(mm:unknown):string {
 const value=inchesInput(mm);return value===''?'Not recorded':`${Number(Number(value).toFixed(4))}″`;
}
export function parseInches(text:string):number {
 const value=text.trim().replace(/(?:inches|inch|in|["″])\s*$/i,'').trim();
 let inches:number;
 if(/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))inches=Number(value);
 else {const m=/^(?:(\d+)[ -]+)?(\d+)\/(\d+)$/.exec(value);if(!m||Number(m[3])===0)throw Error('Enter decimal inches or a fraction, such as 2.5 or 2 1/2.');inches=Number(m[1]??0)+Number(m[2])/Number(m[3]);}
 const mm=inches*25.4;
 if(!Number.isFinite(mm)||mm<=0||mm>10000)throw Error('Enter inches greater than zero and no more than 393.7007874.');
 return mm;
}
/** Never round-trip an unchanged value: retain its exact stored number. */
export function dimensionValue(text:string,original:unknown):number|null {
 if(text===inchesInput(original))return original===null||original===undefined||original===''?null:Number(original);
 return text.trim()===''?null:parseInches(text);
}
