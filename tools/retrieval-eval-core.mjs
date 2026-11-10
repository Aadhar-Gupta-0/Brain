/**
 * Ranking-quality measurements for tenant-scoped knowledge retrieval.
 * Pure module: does not load secrets, make network requests or log queries.
 */
export function rankMetrics(expectedIds, observedIds, k) {
  if (!Array.isArray(expectedIds) || expectedIds.length === 0) {
    throw new Error('Every evaluation case needs at least one expected document ID');
  }
  if (!Number.isSafeInteger(k) || k < 1 || k > 100) {
    throw new Error('k must be an integer between 1 and 100');
  }
  const relevant = new Set(expectedIds.map(String));
  const observed = [...new Set(observedIds.map(String))].slice(0, k);
  let hits = 0, reciprocalRank = 0, dcg = 0;
  observed.forEach((id, index) => {
    if (!relevant.has(id)) return;
    hits++;
    if (!reciprocalRank) reciprocalRank = 1 / (index + 1);
    dcg += 1 / Math.log2(index + 2);
  });
  const maxRelevant = Math.min(relevant.size, k);
  let idcg = 0;
  for (let i = 0; i < maxRelevant; i++) idcg += 1 / Math.log2(i + 2);
  return {
    recall: hits / relevant.size,
    hitRate: hits > 0 ? 1 : 0,
    reciprocalRank,
    ndcg: idcg ? dcg / idcg : 0,
  };
}

export function percentile(sortedNumbers, percentileValue) {
  if (!sortedNumbers.length) return 0;
  const index = Math.ceil((percentileValue / 100) * sortedNumbers.length) - 1;
  return sortedNumbers[Math.min(sortedNumbers.length - 1, Math.max(0, index))];
}

export function summarizeEvaluations(results) {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Evaluation requires at least one completed case');
  }
  const avg = key => results.reduce((sum, result) => sum + result.metrics[key], 0) / results.length;
  const latencies = results.map(result => result.latencyMs).sort((a, b) => a - b);
  return {
    cases: results.length,
    recallAtK: avg('recall'),
    hitRateAtK: avg('hitRate'),
    mrrAtK: avg('reciprocalRank'),
    ndcgAtK: avg('ndcg'),
    latencyMs: { p50: percentile(latencies, 50), p95: percentile(latencies, 95) },
  };
}

export function validateEvalCase(value) {
  if (!value || typeof value !== 'object') throw new Error('Case must be an object');
  if (typeof value.query !== 'string' || !value.query.trim() || value.query.length > 1000) {
    throw new Error('Case query must have 1–1000 characters');
  }
  if (!Array.isArray(value.expectedDocumentIds) || value.expectedDocumentIds.length === 0 ||
      value.expectedDocumentIds.length > 100 ||
      value.expectedDocumentIds.some(id => typeof id !== 'string' || id.length < 1 || id.length > 200)) {
    throw new Error('expectedDocumentIds must contain 1–100 document IDs');
  }
  return {
    query: value.query,
    expectedDocumentIds: [...new Set(value.expectedDocumentIds)],
  };
}
