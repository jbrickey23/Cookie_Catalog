import assert from "node:assert/strict";
import {test} from "node:test";
import {validateReferencePlan} from "../src/SourceReferences";
test("source reference plans preserve identity, reject duplicate identities and cannot specify physical inventory",()=>{
 const item={name:"TEST unprinted source",notes:JSON.stringify({format:"cookie-catalog-source-reference",sourceNamespace:"test",sourceKey:"page:1"})};
 const plan={format:"cookie-catalog-reference-plan",version:1,items:[item]};
 assert.equal(validateReferencePlan(plan).items.length,1);assert.throws(()=>validateReferencePlan({...plan,items:[item,item]}));assert.throws(()=>validateReferencePlan({...plan,items:[{...item,notes:"untracked source"}]}));assert.throws(()=>validateReferencePlan({...plan,items:[{...item,source_url:"javascript:alert(1)"}]}));
});
