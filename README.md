# F0 Scam/Phishing Website Dataset

**F0-v1 · 488 curated scam/phishing website snapshots**

| Acquisition path | Samples | Composition |
|---|---:|---:|
| Historical URLScan | 287 | 58.8% |
| Live captures | 201 | 41.2% |

Live manual review: **205 / 1,191 reviewable captures KEEP**, yielding **201 final unique live samples** after dedup. This is a curated research snapshot, not a raw dump or an independently proven maliciousness ground truth.

## Data sources and selection funnel

Tín Nhiệm Mạng supplies reported suspicious/scam URLs. Historical acquisition recovers URLScan snapshots; live acquisition checks availability and captures current pages. Website content belongs to its respective authors; no ownership or third-party license is asserted.

| Stage | Count | % of previous stage | Notes |
|---|---|---|---|
| Raw reported suspicious/scam URLs | 124,947 | 100.00% | Tín Nhiệm Mạng input records |
| Live HTML records | 1,782 | 1.43% | Live-check HTML heuristic; not a maliciousness verdict |
| Normalized final destinations | 1,616 | 90.68% | Collapse source records sharing a normalized final URL; unit changes to destination groups |
| Capture candidates | 1,579 | 97.71% | Exclude strong normalized-URL overlap with historical clean samples |
| Reviewable captures | 1,191 | 75.43% | Current browser artifacts satisfy technical usability after recovery |
| Manual KEEP | 205 | 17.21% | Manual inclusion/quality decision |
| Final unique live samples | 201 | 98.05% | Skip only screenshot AND DOM duplicate with the same retained sample |
| Historical URLScan | 287 | — | Separate acquisition path; not added to the live denominator |
| **F0-v1 final** | **488** | — | 287 historical + 201 live |

Only **0.161%** of the original reported-URL pool ultimately became unique, review-approved live samples in F0-v1. This is an acquisition/inclusion rate, **not the proportion of malicious URLs**. Historical samples are a separate path and are not mixed into that denominator.

```text
Historical URLScan snapshots → quality validation + manual selection → 287 ─┐
                                                                                ├→ F0-v1: 488
124,947 reported URLs → live-check → dedup/filter → capture + recovery        │
                       → manual review → final artifact dedup → 201 ─────────┘
```

Counts and denominators are verified from local source/capture/review artifacts; [DATASET_REPORT.md](DATASET_REPORT.md) and [selection_funnel.json](selection_funnel.json) provide distributions, calculation methods and evidence hashes.

## Why were URLs/samples excluded?

**Exclusion does not mean that a reported URL was determined to be benign.** This is an acquisition/quality-selection funnel, not benign-vs-malicious classification.

- **Live-check:** 123,165 records did not meet the live-HTML criterion. Recorded outcomes include timeout, DNS/connection/TLS failure, HTTP errors (including 403/404/5xx), invalid URL, redirect loop, and non-HTML response. Failure means no suitable live page was obtained at check time; it does not prove benignness or permanent unavailability. Historical infrastructure may have expired or been taken down, but the logs do not establish the cause for each URL.
- **Destination/overlap filtering:** 166 repeated source records collapsed into normalized destinations, then 37 destination groups overlapped historical clean URLs. Same hostname alone never removes a candidate.
- **Browser capture:** 388 / 1,579 candidates (24.57%) remained non-usable after the final recovery passes. Navigation/network/TLS errors, renderer stalls and insufficient/missing DOM or screenshot can prevent technical completion. Quality flags such as possible parking/error/challenge pages, small DOM or suspected blank screenshots are hints, not automatic exclusion rules. Quality flags are non-exclusive; one capture may have multiple flags.
- **Manual review:** 205 KEEP (17.21%) and 986 REJECT (82.79%) among 1,191 reviewable captures; PENDING = 0. KEEP means the sample met this project's quality/research inclusion criteria under source provenance and manual inspection, not cryptographic proof of phishing. Possible rejection considerations include parking/default/error pages, incomplete or irrelevant content, changed destinations, low-information/duplicate artifacts, or insufficient evidence/quality. These are possible considerations, not measured rejection categories. **Individual manual rejection reasons were not recorded as a mutually exclusive structured taxonomy, so exact per-reason counts are not reported.**
- **Final cross-dedup:** 4 KEEP aliases were skipped because both screenshot and DOM hashes matched the same retained sample. Same hostname, same URL, a single matching artifact or quality flag alone did not justify a skip; provenance remains in merge_audit.json.

## Capture strategies

A successful HTTP response can still leave the browser unable to produce usable artifacts. Recovery therefore uses bounded artifact salvage, response-commit navigation or, for narrowly selected renderer-stall cases, JavaScript-disabled contexts.

| Capture strategy | Final live samples | % of final live |
|---|---|---|
| Normal | 149 | 74.13% |
| Timeout/recovery salvage | 44 | 21.89% |
| Commit fallback | 6 | 2.99% |
| JavaScript-disabled fallback | 2 | 1.00% |
| **Total live** | 201 | 100.00% |

The two no-JS samples retain `javascript_enabled=false`, `capture_strategy=javascript_disabled_fallback`, and `navigation_status=nojs_salvaged`. They represent the site with JavaScript disabled and are not equivalent to JS-enabled rendering. Capture timestamps refer to historical URLScan or live browser capture, not reported-URL collection time.

## Dataset structure and provenance

`manifest.jsonl` / `manifest.json` map each sample to `samples/<sample_id>/screenshot.png`, `dom.txt` and `report.json`. DOM is inert text, not content to execute. Reports retain provenance and capture/recovery metadata, with recognized credential-like values redacted in this public derivative. Original/derivative hashes, duplicate aliases, statistics and validation are recorded in the accompanying JSON files. Private canonical artifacts remain unchanged. Reproducing raw acquisition counts requires the private artifacts identified by hash in selection_funnel.json; the public file contains aggregate statistics, not reviewer runtime state.

## Selection bias and interpretation

F0-v1 favors reported sites with available historical artifacts or live accessibility, successful capture, sufficient DOM/screenshots and manual approval. It is **not a random or representative sample of the original reported-URL pool**. Dead/taken-down and non-capturable sites are underrepresented; this matters when training or evaluating ML. Sites change over time, manual review is subjective, no-JS snapshots differ from normal rendering, and exact hashes do not detect all near-duplicates. Source reports do not independently prove maliciousness. Pattern-based sanitization cannot certify absence of every sensitive value; screenshot pixels were not OCR-scanned.

## Ethical use and citation

Use for research and defensive security. Treat DOM and embedded URLs as untrusted; do not casually visit them or execute captured content. No formal DOI/paper is assigned: cite “F0 Scam/Phishing Website Dataset, F0-v1”, repository URL and snapshot date, with publisher authors supplied when available. No license for third-party website content is inferred.

## Dataset Viewer

A zero-build, read-only static viewer provides a scrollable gallery of all 488 F0-v1 samples, search/source/strategy/year filters, screenshot details and plain-text DOM previews. Dataset URLs are displayed as text; captured HTML is not rendered or executed. Images and requested DOM previews come only from local repository artifacts. No review interface or review state is included.

### GitHub Pages

After pushing the viewer, configure **Settings → Pages → Deploy from a branch → main → /(root)**. The expected URL is `https://tien-bap.github.io/scam-website-dataset-f0/`; deployment has not been verified. GitHub publishes the selected source folder, so `/docs` would not include sibling `samples/`. The root entrypoint and `.nojekyll` serve the existing sample artifacts without copying them.

### Local viewing and regeneration

From the repository root, run `python3 -m http.server 8000`, then open `http://localhost:8000/`. Python is only an optional local static server/offline metadata generator; the hosted viewer has no backend, Flask or database. To regenerate the deterministic metadata projection: `python3 tools/build_viewer_manifest.py`.

`SHA256SUMS` continues to cover the dataset snapshot files; README/report hashes are refreshed and selection_funnel.json is added for this documentation update. `VIEWER_SHA256SUMS` covers the viewer, generator, tests and viewer documentation separately. Original dataset statistics describe the F0-v1 snapshot and exclude the added viewer files. Samples, source manifest, reports, DOM, screenshots, provenance and review semantics are unchanged.
