import assert from 'node:assert/strict';
import test from 'node:test';
import { compareRetrievalReports } from './retrieval-eval-compare-core.mjs';

const baseline = {cases:20,k:10,mode:'hybrid',recallAtK:0.7,hitRateAtK:0.85,mrrAtK:0.6,ndcgAtK:0.65,latencyMs:{p50:100,p95:400}};
const candidate = {...baseline,recallAtK:0.75,ndcgAtK:0.71,latencyMs:{p50:110,p95:440}};

test('reports improvements and acceptable latency',()=>{
 const result=compareRetrievalReports(baseline,candidate);
 assert.equal(result.passed,true);
 assert.equal(result.changes.recallAtK,0.05);
 assert.equal(result.latencyP95IncreasePct,10);
});

test('fails on meaningful relevance regression',()=>{
 const result=compareRetrievalReports(baseline,{...candidate,recallAtK:0.5,ndcgAtK:0.5});
 assert.equal(result.passed,false);
 assert(result.failures.includes('Recall@k declined'));
 assert(result.failures.includes('nDCG@k declined'));
});

test('fails on p95 latency regression',()=>{
 const result=compareRetrievalReports(baseline,{...baseline,latencyMs:{p50:100,p95:800}});
 assert(result.failures.includes('p95 latency regressed'));
});

test('refuses mismatched evaluation settings',()=>{
 assert.throws(()=>compareRetrievalReports(baseline,{...candidate,k:5}),/same case count/);
 assert.throws(()=>compareRetrievalReports(baseline,{...candidate,cases:19}),/same case count/);
 assert.throws(()=>compareRetrievalReports(baseline,{...candidate,mode:'keyword'}),/same case count/);
});

test('rejects invalid input and thresholds',()=>{
 assert.throws(()=>compareRetrievalReports(baseline,{...candidate,recallAtK:NaN}),/not a valid/);
 assert.throws(()=>compareRetrievalReports(baseline,candidate,{maxRecallDrop:-1}),/nonnegative/);
});

test('handles a zero millisecond baseline explicitly',()=>{
 const zero={...baseline,latencyMs:{p50:0,p95:0}};
 assert.equal(compareRetrievalReports(zero,zero).passed,true);
 assert.equal(compareRetrievalReports(zero,candidate).passed,false);
});

test('does not expose queries, document IDs or raw records',()=>{
 const result=compareRetrievalReports({...baseline,secretQuery:'do not share'},candidate);
 assert.equal(JSON.stringify(result).includes('do not share'),false);
});

test('same explicitly named dataset is allowed and reported as checked',()=>{
  const result=compareRetrievalReports({...baseline,datasetId:'incident-runbook-v1'}, {...candidate,datasetId:'incident-runbook-v1'});
  assert.equal(result.datasetIdentityChecked,true);
});
test('mismatched and partial dataset IDs fail closed',()=>{
  assert.throws(()=>compareRetrievalReports({...baseline,datasetId:'runbook-v1'}, {...candidate,datasetId:'runbook-v2'}),/same dataset identity/);
  assert.throws(()=>compareRetrievalReports(baseline,{...candidate,datasetId:'runbook-v1'}),/same dataset identity/);
});
test('legacy comparisons are explicitly marked as lacking corpus verification',()=>{
  assert.equal(compareRetrievalReports(baseline,candidate).datasetIdentityChecked,false);
});
