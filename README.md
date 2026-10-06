# F0 Scam/Phishing Website Dataset

## Overview
F0-v1 is a curated snapshot for research into scam/phishing website detection. URLs were reported as suspicious by Tín Nhiệm Mạng and artifacts were manually selected for research quality. Source reports and KEEP decisions do not independently prove maliciousness or establish absolute ground truth. Website content belongs to its respective authors; this snapshot does not assert ownership or grant rights beyond those held by the sources.

## Data sources
Historical recovery uses Tín Nhiệm Mạng URLs and URLScan historical snapshots (`capture_source=urlscan`). Live recovery uses the same reported-URL source, passive HTTP discovery and isolated Playwright capture (`capture_source=live_playwright`). Original URLs, timestamps and provenance are recorded in reports/manifests.

## Collection methodology
Reported suspicious URLs → historical/live acquisition → technical filtering and destination deduplication → browser capture → bounded recovery strategies → manual quality review → exact artifact deduplication → final validation. Historical and live contributions are described separately in DATASET_REPORT.md.

## Dataset structure
`manifest.jsonl` (and equivalent `manifest.json`) maps one retained sample per row to `samples/<sample_id>/report.json`, `dom.txt`, and `screenshot.png`. DOM is inert text for sharing, not a page to execute. Reports contain original capture metadata with recognized credential-like values redacted. `dataset_stats.json`, `merge_audit.json`, `validation.json`, `sharing_safety.json`, `final_dataset_summary.json` and `SHA256SUMS` support audit and reproduction. SHA256SUMS covers all files except itself.

## Capture strategies
Normal live capture waits for DOMContentLoaded. Timeout salvage inspects current artifacts after bounded navigation. Commit fallback waits only for navigation response commit, then bounded settle and independent artifact extraction. Final no-JS fallback uses `capture_strategy=javascript_disabled_fallback`, `javascript_enabled=false`, `navigation_status=nojs_salvaged`. No-JS snapshots represent the website with JavaScript disabled and are not equivalent to JS-enabled rendering. Historical snapshots retain their source capture semantics.

## Manual review
Technical usability only makes a candidate reviewable. Every retained live sample maps to a manual KEEP decision; technical completion does not imply KEEP. URL overlap, quality flags, same hostname, or one-artifact duplicates never automatically discard a KEEP. Only matching screenshot AND DOM hashes against the same retained sample causes a strong-duplicate skip, with all aliases retained in the audit.

## Limitations
Websites change over time and artifacts are snapshots. Historical scan times and live capture times differ; they are not Tín Nhiệm Mạng collection times. Manual review is subjective. No-JS rendering can omit interactive content. Exact hashes cannot detect all near-duplicates. Reported URLs and manual review do not prove maliciousness absolutely. Pattern-based sanitization does not certify absence of every sensitive value, including values visible in screenshots.

## Reproducibility / provenance
Stable sample/candidate IDs, source/final URLs, source-specific timestamps, original/derivative hashes, recovery metadata and duplicate-alias mappings are retained. `source_dom_sha256` and `source_report_sha256` identify private original artifacts; public hashes verify the sharing derivatives. Canonical artifacts were preserved unchanged. The offline finalization script and input hash snapshot are recorded in final_dataset_summary.json; recreating the exact public snapshot requires the archived private inputs and matching script version.

## Ethical use
Use for research and defensive security. Treat HTML and URLs as untrusted; do not casually visit embedded URLs or execute captured content. No network requests were performed during finalization. No reviewer runtime state, failed/rejected artifacts, browser binaries, debug directories or raw collection logs are shipped.

## Citation
No formal paper/DOI is assigned. Cite “F0 Scam/Phishing Website Dataset, F0-v1”, the repository URL and snapshot date when available. Repository URL/authors are to be supplied by the publisher; no license is inferred for third-party captured content.
