import React from 'react';
import {FieldHelp} from './FieldHelp';
import {BinLink,CutterLink} from './InventoryLinks';
import {formatInches} from './measurements';
import {type InventoryRow} from './inventory';

export const cardFields=[
 {key:'location_id',label:'BIN ID',help:'BIN / location'},
 {key:'quantity',label:'Quantity',help:'Quantity'},
 {key:'reference_size_mm',label:'Reference Size (inches)',help:'Reference size (inches)'},
 {key:'notes',label:'Notes',help:'Cutter notes'}
] as const;
export type CardField=typeof cardFields[number]['key'];
export function CutterTable({row,onOpen,onBin,onEdit,editor}:{row:InventoryRow;onOpen:(id:string)=>void;onBin:(bin:string)=>void;onEdit?:(field:CardField)=>void;editor?:(key:CardField)=>React.ReactNode}){
 const cell=(field:typeof cardFields[number])=>{
  const input=editor?.(field.key);
  const value=field.key==='location_id'?<BinLink location={row.location} onOpen={onBin}/>:field.key==='reference_size_mm'?formatInches(row.reference_size_mm):row[field.key]??'Not recorded';
  return <td colSpan={field.key==='notes'?2:1}><FieldHelp field={field.help}>{field.label}</FieldHelp>
   {input??<div>{value} {onEdit&&<button type="button" className="field-pencil" aria-label={'Change '+field.label} onClick={()=>onEdit(field.key)}>✎</button>}</div>}</td>;
 };
 return <table className="physical-card-table" aria-label={'Physical cutter '+row.id}><tbody>
  <tr><td><strong>Name</strong><div><CutterLink id={row.id} shape={row.shape_id} name={row.name} onOpen={onOpen}/></div></td>{cell(cardFields[0])}</tr>
  <tr>{cell(cardFields[1])}{cell(cardFields[2])}</tr><tr>{cell(cardFields[3])}</tr>
 </tbody></table>;
}
