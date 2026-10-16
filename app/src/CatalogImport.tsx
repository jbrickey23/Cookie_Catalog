import React, { useState } from 'react';
import type { StagingManifest } from './staging.mjs';
import type { ImportChoice } from './server/catalog-import';
type Plan = {
    planSha256: string;
    selected: number;
    ready: number;
    blocked: number;
    alreadyLinked: number;
    rows: {
        sourceKey: string;
        name: string;
        status: string;
        reasons: string[];
        targetId: string;
        shapeId?: string;
        referenceSizeMm: number | null;
        candidates: {
            id: string;
            name: string;
        }[];
    }[];
};
export function CatalogImport({ id, revision, manifest, disabled, onBusy }: {
    id: string;
    revision: string;
    manifest: StagingManifest;
    disabled: boolean;
    onBusy: (busy: boolean) => void;
}) {
    const [selections, setSelections] = useState<Record<string, Partial<ImportChoice>>>({}), [plan, setPlan] = useState<Plan | null>(null), [candidates, setCandidates] = useState<Record<string, {
        id: string;
        name: string;
    }[]>>({});
    const [setup, setSetup] = useState<boolean | null>(null);
    const [backup, setBackup] = useState(''), [confirmed, setConfirmed] = useState(false), [owned, setOwned] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
    function change(key: string, patch: Partial<ImportChoice>) { setSelections(previous => ({ ...previous, [key]: { ...previous[key], ...patch, sourceKey: key } })); setPlan(null); setMessage('Selection changed. Prepare a new inventory plan before importing.'); }
    const choices = Object.values(selections).filter(c => c.action).map(c => ({ sourceKey: c.sourceKey!, action: c.action!, ...(c.action === 'link' ? { targetId: c.targetId ?? '' } : {}), ...(c.action === 'create' && c.shapeId ? { shapeId: c.shapeId } : {}), ...(c.distinctReason?.trim() ? { distinctReason: c.distinctReason.trim() } : {}) }));
    async function run(apply = false) {
        if (apply && (!plan || !window.confirm(`Import ${plan.ready} selected entries into inventory? Linked entries keep their existing values. No inventory will be overwritten.`)))
            return;
        setBusy(true);
        onBusy(true);
        try {
            const response = await fetch(`/api/import-reviews/${id}/${apply ? 'apply' : 'catalog-plan'}`, { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review', 'If-Match': revision }, body: JSON.stringify({ choices, ownershipConfirmed: owned, ...(apply ? { planSha256: plan!.planSha256, backupReference: backup.trim(), backupConfirmed: confirmed } : {}) }) });
            const data = await response.json() as any;
            if (!response.ok) {
                if (response.status === 412)
                    setPlan(null);
                throw Error(data.error ?? 'Inventory import unavailable.');
            }
            if (apply) {
                setPlan(null);
                setConfirmed(false);
                setSelections({});
                setMessage(`Import recorded: ${data.created ?? 0} new inventory records, ${data.linked ?? 0} links to existing records, ${data.alreadyLinked ?? 0} entries already linked. Refresh catalog lists to see the records.`);
            }
            else {
                setPlan(data);
                setCandidates(Object.fromEntries(data.rows.map((r: Plan['rows'][number]) => [r.sourceKey, r.candidates])));
                setMessage('Inventory plan prepared. No inventory records changed. Review the selected entries and any blockers below.');
            }
        }
        catch (error) {
            setMessage((error as Error).message);
        }
        finally {
            setBusy(false);
            onBusy(false);
        }
    }
    async function checkSetup(activate = false) {
        if (activate && !window.confirm('Activate inventory importing? This adds import audit tables and optional size/Slot fields; existing inventory is preserved.'))
            return;
        setBusy(true);
        onBusy(true);
        try {
            const response = await fetch('/api/import-reviews/import-setup', { method: activate ? 'POST' : 'GET', cache: 'no-store', headers: { 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review' }, ...(activate ? { body: JSON.stringify({ backupReference: backup.trim(), backupConfirmed: confirmed }) } : {}) });
            const data = await response.json() as {
                ready: boolean;
                error?: string;
            };
            if (!response.ok)
                throw Error(data.error ?? 'Import setup unavailable.');
            setSetup(data.ready);
            setPlan(null);
            setMessage(data.ready ? 'Inventory importing is ready. Prepare a plan before importing any entries.' : 'Inventory importing needs activation. Save and verify a protected pre-change backup, then enter its reference below.');
            if (activate)
                setConfirmed(false);
        }
        catch (error) {
            setMessage((error as Error).message);
        }
        finally {
            setBusy(false);
            onBusy(false);
        }
    }
    return <details><summary>Import reviewed entries into inventory</summary>
  <p>Choose individual entries to create or link to existing records. Everything starts as “Leave for later”. Work in batches of at most 50. Quantity defaults to one per individual cutter unless you entered another quantity. Confirm selected cutters are owned; missing measurements and photos remain collection tasks.</p>
  <p>Linking preserves the existing record and quantity. Different sizes use separate physical cutter records, normally quantity one each. Reuse their existing shape when known; identical copies at the same size share a quantity. Designs import independently; component sets and printable originals need separate review. No photos or source files are uploaded by this import.</p>
  <fieldset disabled={disabled || busy}><legend>Inventory decisions</legend>
   <button onClick={() => void checkSetup()}>Check import setup</button>
   <p><label>Protected pre-change backup reference <input maxLength={500} value={backup} placeholder="Saved backup filename or receipt SHA-256" onChange={e => { setBackup(e.target.value); setConfirmed(false); }}/></label></p>
   <p><label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/> I saved and verified a protected pre-change backup for this change.</label> Your backup reference is recorded with inventory imports; the server cannot verify your local backup or OneDrive copy.</p>
   {setup === false && <button disabled={!backup.trim() || !confirmed} onClick={() => void checkSetup(true)}>Activate inventory importing</button>}
   {manifest.items.map((item, index) => <div key={item.sourceKey} style={{ borderBottom: '1px solid #ccc', padding: '.75rem 0' }}>
    <label>{index + 1}. {item.name} — <select aria-label={'Inventory action for ' + item.name} value={selections[item.sourceKey]?.action ?? ''} onChange={e => change(item.sourceKey, { action: (e.target.value || undefined) as ImportChoice['action'] | undefined, targetId: undefined })}>
     <option value="">Leave for later</option><option value="create">Create new inventory record</option><option value="link">Link existing inventory record</option>
    </select></label>
    {selections[item.sourceKey]?.action === 'link' && <p><label>Existing record ID <input value={selections[item.sourceKey]?.targetId ?? ''} list={'targets-' + index} onChange={e => change(item.sourceKey, { targetId: e.target.value })}/></label><datalist id={'targets-' + index}>{candidates[item.sourceKey]?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</datalist><br />Open the existing catalog record with Edit/View details to find its ID. Use a physical cutter ID or design ID here. A plan can suggest matching records below.</p>}
    {selections[item.sourceKey]?.action === 'create' && item.kind === 'physical_cutter' && <p><label>Existing shape ID, if this is another size of a known shape <input value={selections[item.sourceKey]?.shapeId ?? ''} onChange={e => change(item.sourceKey, { shapeId: e.target.value || undefined })}/></label><br />Leave blank for a new shape. A unique matching shape is reused automatically when all known matching cutters have a different reference size.</p>}
    {selections[item.sourceKey]?.action === 'create' && <p><label>Reason this is a separate item, if a duplicate is flagged <input maxLength={500} value={selections[item.sourceKey]?.distinctReason ?? ''} onChange={e => change(item.sourceKey, { distinctReason: e.target.value })}/></label></p>}
   </div>)}
   <p>{choices.length} selected; {manifest.items.length - choices.length} left for later.</p>
   <p><label><input type="checkbox" checked={owned} onChange={e => { setOwned(e.target.checked); setPlan(null); }}/> I confirm that the selected physical cutters are owned. Entries marked not owned or not printed remain blocked.</label></p>
   <button disabled={!choices.length || choices.length > 50} onClick={() => void run()}>Prepare inventory plan</button>
   {plan && <div><h4>Inventory plan</h4><p>{plan.ready} ready, {plan.blocked} blocked, {plan.alreadyLinked} already linked.</p><ul>{plan.rows.map(r => <li key={r.sourceKey}>{r.name}: {r.status.replaceAll('_', ' ')}{r.status !== 'blocked' && ` — ${r.targetId}`}{r.shapeId && <span> · Shape: {r.shapeId}</span>}{r.referenceSizeMm !== null && <span> · Reference size: {Number((r.referenceSizeMm / 25.4).toFixed(4))}″ ({r.referenceSizeMm} mm)</span>}<ul>{r.reasons.map(reason => <li key={reason}>{reason}</li>)}{r.candidates.map(c => <li key={c.id}>Possible existing record: {c.name} — {c.id}</li>)}</ul></li>)}</ul>
    <p>Recorded locations and OneNote bins become inventory locations without further confirmation. Reference sizes, Slot and review evidence stay attached to the source mapping; reference size is not substituted for width or height.</p>
    <button disabled={!plan.ready || !!plan.blocked || !backup.trim() || !confirmed} onClick={() => void run(true)}>Import selected entries</button><p>Only an owner/admin can apply the plan. Concurrent inventory changes require a new plan. Repeating a completed request does not create duplicate records.</p>
   </div>}
  </fieldset>
  {disabled && <p>Save changes or reopen the latest saved review before planning an inventory import.</p>}
  <p role="status" aria-live="polite">{message}</p>
 </details>;
}
