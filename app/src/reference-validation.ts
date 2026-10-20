import {shapeFields,cutterFields} from './inline-fields';
export function entryError(shape:Record<string,any>,cutter:Record<string,any>|null,referenceLocked=false):{group:'shape'|'cutter';key:string;message:string}|null{
 for(const [group,row,specs] of [['shape',shape,shapeFields],['cutter',cutter,cutterFields]] as const){
  if(!row||group==='shape'&&referenceLocked)continue;
  for(const spec of specs){const value=row[spec.key],text=String(value??'').trim();let message='';
   if(spec.required&&!text)message=`Enter ${spec.label.toLowerCase()}.`;
   else if(spec.max&&text.length>spec.max)message=`Use at most ${spec.max} characters.`;
   else if(spec.key==='source_url'&&text){try{if(!/^https?:\/\//i.test(text)||!new URL(text).hostname)throw Error();}catch{message='Enter a complete source URL beginning with http:// or https://, or leave it empty.';}}
   else if(spec.editor==='number'&&text){const n=Number(value);if(!Number.isFinite(n)||n<0||n>10000||spec.key!=='quantity'&&n===0||spec.key==='quantity'&&!Number.isInteger(n))message=spec.key==='quantity'?'Enter a whole quantity from 0 to 10000.':'Enter a dimension greater than zero and at most 10000 mm.';}
   if(message)return {group,key:spec.key,message};
  }
 }
 return null;
}
