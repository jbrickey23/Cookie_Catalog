export type Location = {id:string; label:string};

const presets = [...Array.from({length:50}, (_, i) => 'BIN '+(i+1)), 'Classes'];
export function locationKey(label:string) {
  return label.trim().replace(/\s+/g,' ').replace(/^bin\s*[#-]?\s*(\d+[a-z]?)$/i,'BIN $1').toLowerCase();
}
const ranks = new Map(presets.map((label,index)=>[locationKey(label),index]));
export function presetLabel(label:string) {
  const rank=ranks.get(locationKey(label));
  return rank===undefined?undefined:presets[rank];
}
export function isPreset(label:string) {
  return ranks.has(locationKey(label));
}

// A colon cannot occur in a catalog API ID. These choices are materialized only on Save.
export function locationChoices(stored:Location[]) {
  const keys = new Set(stored.map(row => locationKey(row.label)));
  const missing = presets.filter(label => !keys.has(locationKey(label))).map(label => ({id:'preset:'+label,label}));
  return [...stored,...missing].sort((a,b) => {
    return (ranks.get(locationKey(a.label))??presets.length)-(ranks.get(locationKey(b.label))??presets.length) || a.label.localeCompare(b.label);
  });
}
