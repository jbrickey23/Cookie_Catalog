import type {ReviewKind,FieldReview,ReviewField} from "./readiness";
export interface StagingFile {path:string;purpose:"cutter_photo"|"scale_photo"|"design_photo"|"printable_original"|"source_page"|"unknown";sha256?:string;}
export interface StagingItem {
  sourceKey:string;kind:ReviewKind;name:string;
  source:{pageId:string;pageTitle?:string;sectionPath?:string;url?:string};
  facts?:{widthMm?:number;heightMm?:number;location?:string;source?:string};
  catalog?:{ownership?:"unknown"|"owned"|"not_owned";printStatus?:"unknown"|"printed"|"not_printed"|"not_applicable";quantity?:number;referenceSizeMm?:number;originalSizeLabel?:string;slot?:string};
  files?:StagingFile[];
  reviews?:Partial<Record<ReviewField,FieldReview>>;
}
export interface StagingManifest {format:"cookie-catalog-staging";version:1;sourceNamespace:string;items:StagingItem[];}
export const kinds:readonly ReviewKind[];
export const purposes:readonly StagingFile["purpose"][];
export function validateManifest(input:unknown):StagingManifest;

export function text(value:unknown,max?:number):value is string;
