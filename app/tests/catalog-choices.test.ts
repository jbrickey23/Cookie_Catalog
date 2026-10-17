import assert from "node:assert/strict";
import {test} from "node:test";
import {catalogChoices} from "../src/catalog-choices";
test("linked selectors include choices beyond the first 200 and strip unrelated metadata",async()=>{
  const calls:string[]=[];
  const fake=async (input:unknown)=>{
    calls.push(String(input));const offset=Number(new URL(String(input),"https://example.test").searchParams.get("offset"));
    return Response.json({records:Array.from({length:offset===0?200:3},(_,i)=>({id:"s"+(offset+i),name:"Tree "+(offset+i),notes:"not needed"})),nextOffset:offset===0?200:null});
  };
  const choices=await catalogChoices("shapes",fake as typeof fetch);assert.equal(choices.length,203);assert.equal(choices[202].id,"s202");assert.equal(calls.length,2);assert.ok(!("notes" in choices[0]));
});
test("selectors reject page errors, non-progressing offsets and duplicates instead of silently accepting partial data",async()=>{
  for(const body of [{records:[{id:"s",name:"Tree"}],nextOffset:0},{records:"bad",nextOffset:null},{records:[{id:"s"}],nextOffset:null}])
    await assert.rejects(catalogChoices("shapes",(async()=>Response.json(body)) as typeof fetch));
  let n=0;
  await assert.rejects(catalogChoices("shapes",(async()=>Response.json({records:[{id:"same",name:"Tree"}],nextOffset:++n})) as typeof fetch),/changed/);
  await assert.rejects(catalogChoices("shapes",(async()=>Response.json({error:"Denied"},{status:403})) as typeof fetch),/Denied/);
});
