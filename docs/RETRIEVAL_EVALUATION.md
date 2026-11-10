# Brain retrieval quality evaluation

This edition includes a repeatable quality-gate for the most important product promise: **finding the right organizational evidence**.

## 1. Create a private labeled dataset

Create a newline-delimited JSON file outside version control, with one question and one or more relevant document IDs per line:

```jsonl
{"query":"What was agreed for the release?", "expectedDocumentIds":["your-document-id-1"]}
{"query":"Where is the incident runbook?", "expectedDocumentIds":["your-document-id-2","your-document-id-3"]}
```

Use real IDs returned by your own tenant's `/v1/search` or `/v1/memories` endpoint. These examples are placeholders and **are not real benchmark results**.

Treat queries and relevance labels as private workspace information. Do not commit them, paste them into issues, or send them to third-party analytics.

## 2. Run the evaluation locally

```bash
export BRAIN_API_URL=http://127.0.0.1:3333
export BRAIN_API_TOKEN='<your personal API key>'
node tools/retrieval-eval.mjs --cases /path/to/private-cases.jsonl --k 10 --output /tmp/retrieval-summary.json
```

The tool sends the questions only to the configured CompanyBrain API under **your existing bearer credential**, so normal organization-scoped retrieval applies. Remote endpoints must use HTTPS. The output contains only aggregate statistics, not raw queries or token values.

## 3. Quality gates

```bash
node tools/retrieval-eval.mjs --cases /path/to/private-cases.jsonl --k 10 --min-recall 0.80
```

Metrics:

- **Recall@k**: fraction of relevant documents retrieved in the first `k` results
- **Hit rate@k**: share of queries retrieving at least one relevant document
- **MRR@k**: reciprocal rank of the first relevant hit
- **nDCG@k**: relevance-weighted ranking quality (binary relevance)
- **Latency p50/p95**: observed end-to-end response time from the calling machine

Keep the **same labeled dataset** for comparisons. These metrics do not measure factuality of generated answers, citation faithfulness, or connector ingestion completeness. Add those evaluations before declaring end-to-end RAG quality.

## Security boundaries

- Auth token is read only from `BRAIN_API_TOKEN`; never pass it on the command line.
- Evaluation sends questions to a live API. It does **not** create or mutate memories.
- Up to 500 cases, top-k at most 100, and a 15-second per-case request timeout.
- No query text, raw retrieved document content, or document identifiers in the output report.
- This remains a developer-only evaluation tool, not a production monitoring service.

Run the deterministic metric tests with `node --test tools/retrieval-eval-core.test.mjs`.

## 4. Compare two release candidates

Use the **same private labeled dataset**, tenant, retrieval mode, top-k, and evaluation settings for both runs. Save their aggregate-only JSON summaries, then check a release candidate:

```bash
node tools/retrieval-eval-compare.mjs /tmp/baseline.json /tmp/candidate.json
```

Optional positional thresholds specify the maximum absolute Recall@k loss, maximum absolute nDCG@k loss, and maximum percentage increase in p95 latency:

```bash
node tools/retrieval-eval-compare.mjs baseline.json candidate.json 0.01 0.01 15
```

The command exits with status **0** when the thresholds pass, **1** for a regression, and **2** for invalid input. Its output includes only metric deltas and pass/fail reasons, never queries or document contents.

**Caveat:** The checker verifies that both reports have the same case count, `k`, and retrieval mode; it cannot prove they used the same query corpus or labels. Preserve the evaluation corpus separately and version it privately.

The command is designed to be used in release gates; do not claim improved search quality until results have been collected from a meaningful real-world dataset.
