#!/usr/bin/env node
/**
 * Evaluate live CompanyBrain retrieval with a fixed, private labeled query set.
 * Queries and document IDs are NEVER printed or included in summary output.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { rankMetrics, summarizeEvaluations, validateEvalCase } from './retrieval-eval-core.mjs';

function cliArgs(argv) {
  const args = { file: undefined, k: 10, output: undefined, minRecall: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--cases') args.file = argv[++i];
    else if (arg === '--k') args.k = Number(argv[++i]);
    else if (arg === '--output') args.output = argv[++i];
    else if (arg === '--min-recall') args.minRecall = Number(argv[++i]);
    else throw new Error('Unknown or missing argument: ' + arg);
  }
  if (!args.file || !Number.isSafeInteger(args.k) || args.k < 1 || args.k > 100) {
    throw new Error('Usage: node tools/retrieval-eval.mjs --cases private.jsonl [--k 10] [--output report.json] [--min-recall 0.75]');
  }
  if (args.minRecall !== undefined && (!Number.isFinite(args.minRecall) || args.minRecall < 0 || args.minRecall > 1)) {
    throw new Error('--min-recall must be between 0 and 1');
  }
  return args;
}

async function main() {
  const options = cliArgs(process.argv.slice(2));
  const baseUrl = process.env.BRAIN_API_URL ?? 'http://127.0.0.1:3333';
  const credential = process.env.BRAIN_API_TOKEN;
  if (!credential) throw new Error('BRAIN_API_TOKEN must be configured in the environment');
  const url = new URL('/v1/search', baseUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported API URL scheme');
  if (url.protocol === 'http:' && !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    throw new Error('Nonlocal API endpoints must use HTTPS');
  }
  const lines = readFileSync(options.file, 'utf8').split(/\r?\n/).filter(line => line.trim());
  if (!lines.length || lines.length > 500) throw new Error('Expected between 1 and 500 test cases');
  const cases = lines.map(line => validateEvalCase(JSON.parse(line)));
  const results = [];
  for (let i = 0; i < cases.length; i++) {
    const item = cases[i];
    const started = performance.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + credential,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({q: item.query, limit: options.k, mode: 'hybrid'}),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      // Do not echo responses: authentication failures can contain details.
      throw new Error('Search case ' + (i + 1) + ' failed (HTTP ' + response.status + ')');
    }
    const data = await response.json();
    if (!Array.isArray(data.hits)) throw new Error('Search API did not return a hits array');
    results.push({
      metrics: rankMetrics(item.expectedDocumentIds, data.hits.map(hit => hit.documentId), options.k),
      latencyMs: Math.round(performance.now() - started),
    });
  }
  const summary = {
    version: 1,
    generatedAt: new Date().toISOString(),
    mode: 'hybrid',
    k: options.k,
    ...summarizeEvaluations(results),
  };
  const json = JSON.stringify(summary, null, 2);
  if (options.output) writeFileSync(options.output, json + '\n', {mode:0o600});
  process.stdout.write(json + '\n');
  if (options.minRecall !== undefined && summary.recallAtK < options.minRecall) {
    process.stderr.write('Retrieval regression: recall below required threshold.\n');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  // Limit the visible error to safe messages; never print request bodies/tokens.
  const safe = error instanceof Error ? error.message : 'Unexpected error';
  process.stderr.write('Evaluation failed: ' + safe.slice(0, 240) + '\n');
  process.exitCode = 1;
});
