// Presentation configuration only. Server validation and roles remain authoritative.
export type FieldSpec={key:string;label:string;editor:'text'|'textarea'|'number'|'select';source?:'locations'|'origin';required?:boolean;max?:number;step?:string;createAllowed:false};
export const shapeFields:FieldSpec[]=[
 {key:'name',label:'Name',editor:'text',required:true,max:200,createAllowed:false},
 {key:'maker',label:'Maker',editor:'text',max:200,createAllowed:false},
 {key:'source_url',label:'Source link',editor:'text',max:2000,createAllowed:false},
 {key:'notes',label:'Shape notes',editor:'textarea',max:4000,createAllowed:false}
];
export const cutterFields:FieldSpec[]=[
 {key:'location_id',label:'BIN / location',editor:'select',source:'locations',createAllowed:false},
 {key:'quantity',label:'Quantity',editor:'number',required:true,step:'1',createAllowed:false},
 {key:'origin',label:'Origin',editor:'select',source:'origin',required:true,createAllowed:false},
 {key:'reference_size_mm',label:'Reference size (mm)',editor:'number',step:'any',createAllowed:false},
 {key:'width_mm',label:'Width (mm)',editor:'number',step:'any',createAllowed:false},
 {key:'height_mm',label:'Height (mm)',editor:'number',step:'any',createAllowed:false},
 {key:'slot',label:'Slot',editor:'text',max:200,createAllowed:false},
 {key:'notes',label:'Cutter notes',editor:'textarea',max:4000,createAllowed:false}
];
export const vocabularyPolicy={tags:{editor:'searchable-multiselect',createAllowed:true},shape:{editor:'searchable-select',createAllowed:true,required:['name']},location:{editor:'select',createAllowed:false}} as const;
