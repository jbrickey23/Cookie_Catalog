import assert from 'node:assert/strict';
import {test} from 'node:test';
import {requestJson} from '../src/request-json';
test('safe progress requests recover from transient HTML responses; record mutations never silently retry',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>++calls===1?new Response('<!DOCTYPE html>temporarily unavailable',{status:503,headers:{'content-type':'text/html'}}):Response.json({status:'complete'});
 try{assert.deepEqual(await requestJson('/progress',{method:'POST'},true),{status:'complete'});assert.equal(calls,2);calls=0;await assert.rejects(()=>requestJson('/entry',{method:'POST'},false),/unexpected response/);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});

test('unexpected provider responses expose only status and a numeric error code',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('<title>Worker exceeded resource limits</title><h1>Error 1102</h1><p>private response details</p>',{status:500,headers:{'content-type':'text/html'}});
 try{await assert.rejects(()=>requestJson('/progress',{method:'POST'}),error=>{assert.match((error as Error).message,/HTTP 500, provider error 1102/);assert.doesNotMatch((error as Error).message,/private response details/);return true;});}finally{globalThis.fetch=original;}
});
