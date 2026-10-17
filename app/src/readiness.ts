/** Shared, deterministic review rules. Presence is not evidence of verification. */
export type ReviewKind = "physical_cutter" | "printable_asset" | "design" | "unclassified";
export type ReviewState = "unknown" | "needs_verification" | "not_applicable" | "complete";
export type ReviewField = "classification" | "dimensions" | "location" | "photo" | "scale_photo" | "original" | "source";
export interface Evidence { reference: string; method: "measured" | "visual_review" | "source_review" | "file_check"; }
export interface FieldReview { state: ReviewState; note?: string; evidence?: Evidence; }
export interface ReviewItem {
  id: string; kind: ReviewKind; name: string;
  facts: { widthMm?: number; heightMm?: number; location?: string; photo?: boolean; scalePhoto?: boolean; original?: boolean; source?: string };
  reviews?: Partial<Record<ReviewField, FieldReview>>;
}
export interface ReviewCheck { field: ReviewField; label: string; state: ReviewState; action: string; note?: string; }
const labels: Record<ReviewField,string> = {classification:"Item type / ownership",dimensions:"Width and height",location:"Physical storage location",photo:"Identifying image",scale_photo:"Photo with scale reference",original:"Printable original",source:"Source / provenance"};
export function applicableFields(kind: ReviewKind): ReviewField[] {
  if (kind === "physical_cutter") return ["dimensions","location","photo","scale_photo","source"];
  if (kind === "printable_asset") return ["dimensions","photo","original","source"];
  if (kind === "design") return ["photo","source"];
  return ["classification","source"];
}
export function present(item: ReviewItem, field: ReviewField): boolean {
  const f=item.facts;
  if(field==="classification")return item.kind!=="unclassified";
  if(field==="dimensions")return Number.isFinite(f.widthMm)&&Number(f.widthMm)>0&&Number.isFinite(f.heightMm)&&Number(f.heightMm)>0;
  if(field==="location")return !!f.location?.trim();
  if(field==="photo")return f.photo===true;
  if(field==="scale_photo")return f.scalePhoto===true;
  if(field==="original")return f.original===true;
  return !!f.source?.trim();
}
const actions: Record<ReviewField,string> = {
  classification:"Identify whether this is a physical cutter, printable file, decorating design or several separate items.",
  dimensions:"Record width and height in millimeters with orientation and measurement method. Do not infer size from an unscaled photo.",
  location:"Find the physical cutter and record its storage location.",
  photo:"Capture or identify a clear image of this item; distinguish a cutter photo, printable preview and decorated example.",
  scale_photo:"Capture the cutter beside a ruler or other known scale in the same plane; confirm the reference value and units.",
  original:"Locate the authorized original STL/3MF and verify its file identity and licensing/source notes.",
  source:"Preserve the original page/file reference and confirm which item the source describes."
};
export function reviewChecks(item: ReviewItem): ReviewCheck[] {
  return applicableFields(item.kind).map(field=>{
    if(field==="location"&&present(item,field))return {field,label:labels[field],state:"complete" as const,action:"Recorded location: "+item.facts.location+". Update the location if it changes; no separate bin confirmation is required."};
    if(field==="location")return {field,label:labels[field],state:"unknown" as const,action:"Record the bin/location when known. This is separate from Physical/Digital status."};
    const review=item.reviews?.[field];
    let state:ReviewState=present(item,field)?"needs_verification":"unknown";
    if(review?.state==="complete") {
      const e=review.evidence;
      // Staging validator enforces method specificity; rule also refuses missing evidence/value.
      const method=field==="dimensions"?"measured":field==="original"?"file_check":["photo","scale_photo","location"].includes(field)?"visual_review":"source_review";
      if(present(item,field)&&e?.reference.trim()&&e.method===method)state="complete";
    } else if(review?.state==="not_applicable" && review.note?.trim() && !["classification","source","original"].includes(field))state="not_applicable";
    else if(review?.state==="unknown"||review?.state==="needs_verification")state=review.state;
    return {field,label:labels[field],state,action:actions[field],...(review?.note?{note:review.note}:{})};
  });
}
export function readiness(item: ReviewItem) {
  const checks=reviewChecks(item),open=checks.filter(c=>c.state==="unknown"||c.state==="needs_verification");
  return {checks,openCount:open.length,complete:open.length===0};
}
