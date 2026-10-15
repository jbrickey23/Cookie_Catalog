import type {StagingManifest} from "./staging.mjs";
/** Metadata-only proposal. Never certifies file bytes or writes catalog records. */
export function importPreview(manifest:StagingManifest) {
  const counts={items:manifest.items.length,physical:0,printables:0,designs:0,unclassified:0,ownershipUnknown:0,quantityUnknown:0,notOwned:0,notPrintedPhysical:0,referenceSizeUnknown:0,dimensionsUnknown:0,originalReferenceMissing:0};
  for(const item of manifest.items){
    if(item.kind==="unclassified"){counts.unclassified++;continue;}
    if(item.kind==="physical_cutter")counts.physical++;
    if(item.kind==="printable_asset")counts.printables++;
    if(item.kind==="design")counts.designs++;
    if(item.kind!=="design"){
      if(!item.catalog?.ownership||item.catalog.ownership==="unknown")counts.ownershipUnknown++;
      if(item.catalog?.ownership==="not_owned")counts.notOwned++;
      if(!item.catalog?.referenceSizeMm)counts.referenceSizeUnknown++;
      if(!item.facts?.widthMm||!item.facts?.heightMm)counts.dimensionsUnknown++;
    }
    if(item.kind==="physical_cutter"){
      if(item.catalog?.quantity===undefined)counts.quantityUnknown++;
      if(item.catalog?.printStatus==="not_printed")counts.notPrintedPhysical++;
    }
    if(item.kind==="printable_asset"&&!item.files?.some(f=>f.purpose==="printable_original"))counts.originalReferenceMissing++;
  }
  return {mode:"preview" as const,liveWrites:false,filesVerified:false,catalogWrites:0,counts,
    blockers:[...(counts.unclassified?["Classify source entries and split sets into the required records."]:[]),
      ...(counts.notOwned?["Separate items marked not owned from owned inventory."]:[]),
      ...(counts.notPrintedPhysical?["Items marked not printed cannot establish a printed physical cutter."]:[]),
      ...(counts.ownershipUnknown?["Confirm ownership before creating owned inventory."]:[]),
      ...(counts.quantityUnknown?["Individual cutters will default to quantity one at import; review exceptions or sets."]:[])],
    next:"This preview records source classifications and gaps only. Use the inventory plan to review mappings and duplicates before importing selected entries. Original-file uploads remain separate; record a verified protected pre-change backup before applying."};
}
