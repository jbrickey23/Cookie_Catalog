import assert from "node:assert/strict";
import {test} from "node:test";
import {validateImagePlan} from "../src/BatchAttachments";
test("image batch plans require exact hashes, safe filenames, explicit target identity and no duplicate mapping",()=>{
 const item={recordId:"shape_test",file:"test.png",filename:"Test_Source_Reference.png",sha256:"a".repeat(64)};
 const plan={format:"cookie-catalog-image-plan",version:1,items:[item]};
 assert.equal(validateImagePlan(plan).items.length,1);
 for(const patch of [{file:"../test.png"},{filename:"payload.svg"},{recordId:"../other"},{sha256:"not-a-hash"}])assert.throws(()=>validateImagePlan({...plan,items:[{...item,...patch}]}));
 assert.throws(()=>validateImagePlan({...plan,items:[item,item]}));assert.throws(()=>validateImagePlan({...plan,items:[]}));
 assert.equal(validateImagePlan({...plan,items:[item,{...item,recordId:"shape_other"}]}).items.length,2);
});
