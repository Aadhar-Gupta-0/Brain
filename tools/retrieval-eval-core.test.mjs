import assert from 'node:assert/strict';
import test from 'node:test';
import {rankMetrics, percentile, summarizeEvaluations, validateEvalCase} from './retrieval-eval-core.mjs';

test('perfect retrieval scores 1 on all ranking metrics', () => {
  const m = rankMetrics(['doc-a', 'doc-b'], ['doc-a', 'doc-b'], 3);
  for (const value of Object.values(m)) assert.equal(value, 1);
});

test('retrieval penalizes missing and late relevant documents', () => {
  const m = rankMetrics(['a', 'b'], ['unrelated', 'a'], 2);
  assert.equal(m.recall, 0.5);
  assert.equal(m.reciprocalRank, 0.5);
  assert(m.ndcg > 0 && m.ndcg < 1);
});

test('no relevant hits returns zero without division errors', () => {
  assert.deepEqual(rankMetrics(['a'], ['b'], 1), {
    recall: 0, hitRate: 0, reciprocalRank: 0, ndcg: 0,
  });
});

test('duplicate returned documents do not inflate scores', () => {
  assert.deepEqual(rankMetrics(['a'], ['a', 'a', 'x'], 3), rankMetrics(['a'], ['a', 'x'], 3));
});

test('duplicate result slots cannot pull a relevant hit from beyond top-k', () => {
  const m = rankMetrics(['a'], ['noise', 'noise', 'a'], 2);
  assert.equal(m.recall, 0);
  assert.equal(m.reciprocalRank, 0);
});

test('validation bounds evaluation inputs', () => {
  assert.throws(() => rankMetrics([], [], 10));
  assert.throws(() => rankMetrics(['a'], [], 0));
  assert.throws(() => validateEvalCase({query:' ', expectedDocumentIds:['a']}));
  assert.throws(() => validateEvalCase({query:'q', expectedDocumentIds:[]}));
  assert.deepEqual(validateEvalCase({query:'q', expectedDocumentIds:['a', 'a']}).expectedDocumentIds, ['a']);
});

test('summaries compute recall, ranking metrics and latency without leaking raw queries', () => {
  const rows = [
    {metrics:rankMetrics(['a'], ['a'], 2), latencyMs:100},
    {metrics:rankMetrics(['a'], ['b'], 2), latencyMs:500},
  ];
  const summary = summarizeEvaluations(rows);
  assert.equal(summary.cases, 2);
  assert.equal(summary.recallAtK, 0.5);
  assert.equal(summary.latencyMs.p50, 100);
  assert.equal(summary.latencyMs.p95, 500);
  assert.equal(percentile([], 95), 0);
});

test('empty evaluation results fail clearly', () => {
  assert.throws(() => summarizeEvaluations([]));
});
