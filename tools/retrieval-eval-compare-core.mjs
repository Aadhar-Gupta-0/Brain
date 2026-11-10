/**
 * Compare two private retrieval-evaluation summaries without exposing queries.
 * The input must come from the same evaluation fixture and top-k setting.
 * Explicitly refuses comparisons across different case counts or retrieval modes.
 */
const METRICS = ['recallAtK', 'hitRateAtK', 'mrrAtK', 'ndcgAtK'];
export function compareRetrievalReports(baseline, candidate, {maxRecallDrop = 0.02, maxNdcgDrop = 0.02, maxP95IncreasePct = 25} = {}) {
  for (const [label, report] of [['baseline', baseline], ['candidate', candidate]]) {
    if (!report || typeof report !== 'object' ||
        !Number.isSafeInteger(report.cases) || report.cases < 1 ||
        !Number.isSafeInteger(report.k) || report.k < 1 ||
        typeof report.mode !== 'string' ||
        !report.latencyMs || !Number.isFinite(report.latencyMs.p95) || report.latencyMs.p95 < 0 ||
        METRICS.some(m => !Number.isFinite(report[m]) || report[m] < 0 || report[m] > 1)) {
      throw new Error(label + ' is not a valid aggregate retrieval report');
    }
  }
  if (baseline.cases !== candidate.cases || baseline.k !== candidate.k || baseline.mode !== candidate.mode) {
    throw new Error('Reports must use the same case count, k and retrieval mode');
  }
  for (const [name, value] of Object.entries({maxRecallDrop,maxNdcgDrop,maxP95IncreasePct})) {
    if (!Number.isFinite(value) || value < 0) throw new Error(name + ' must be nonnegative and finite');
  }
  const changes = Object.fromEntries(METRICS.map(metric => [
    metric, Number((candidate[metric] - baseline[metric]).toFixed(6)),
  ]));
  const latencyIncreasePct = baseline.latencyMs.p95 === 0
    ? (candidate.latencyMs.p95 === 0 ? 0 : null)
    : Number(((candidate.latencyMs.p95 - baseline.latencyMs.p95) / baseline.latencyMs.p95 * 100).toFixed(3));
  const failures = [];
  if (changes.recallAtK < -maxRecallDrop) failures.push('Recall@k declined');
  if (changes.ndcgAtK < -maxNdcgDrop) failures.push('nDCG@k declined');
  if (latencyIncreasePct === null || latencyIncreasePct > maxP95IncreasePct) failures.push('p95 latency regressed');
  return {
    comparable: true,
    cases: candidate.cases,
    k: candidate.k,
    mode: candidate.mode,
    changes,
    latencyP95IncreasePct: latencyIncreasePct,
    passed: failures.length === 0,
    failures,
  };
}
