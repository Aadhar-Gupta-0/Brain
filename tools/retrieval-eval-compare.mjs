#!/usr/bin/env node
/**
 * Compare privacy-preserving aggregate metrics produced by retrieval-eval.mjs.
 * Reports must use the same corpus, cases, labels, mode, and top-k.
 * (The tool can verify shape/settings but cannot verify corpus identity.)
 */
import {readFileSync} from 'node:fs';
import {compareRetrievalReports} from './retrieval-eval-compare-core.mjs';

const [baselineFile, candidateFile, recallDrop, ndcgDrop, latencyIncrease] = process.argv.slice(2);
if (!baselineFile || !candidateFile) {
  process.stderr.write('Usage: node tools/retrieval-eval-compare.mjs baseline.json candidate.json [maxRecallDrop] [maxNdcgDrop] [maxP95IncreasePct]\n');
  process.exit(2);
}
try {
  const baseline = JSON.parse(readFileSync(baselineFile,'utf8'));
  const candidate = JSON.parse(readFileSync(candidateFile,'utf8'));
  const options = {
    maxRecallDrop: recallDrop === undefined ? 0.02 : Number(recallDrop),
    maxNdcgDrop: ndcgDrop === undefined ? 0.02 : Number(ndcgDrop),
    maxP95IncreasePct: latencyIncrease === undefined ? 25 : Number(latencyIncrease),
  };
  const result = compareRetrievalReports(baseline,candidate,options);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if (!result.passed) process.exitCode=1;
} catch {
  process.stderr.write('Unable to compare the aggregate reports. Check input files and evaluation settings.\n');
  process.exitCode=2;
}
