# F0 clean dataset

Existing URLScan clean: 287  
Live reviewed: 1191  
Live KEEP before final dedup: 205  
Live skipped as exact duplicate: 4  
Live merged: 201  
**FINAL CLEAN SAMPLES: 488**

Capture sources: `{"live_playwright": 201, "urlscan": 287}`.  
Unique source hostnames: 465.  
Unique final/captured hostnames: 454.  
Exact screenshot duplicate groups: 16.  
Exact DOM duplicate groups: 16.  
Retained live ambiguities: 4.

Capture dates (original source-specific capture time): `{"2024-02-01": 1, "2024-10-23": 1, "2024-11-08": 1, "2024-11-11": 2, "2024-11-13": 1, "2024-11-15": 1, "2024-12-11": 1, "2024-12-20": 1, "2024-12-22": 1, "2025-01-09": 1, "2025-02-19": 1, "2025-02-22": 1, "2025-02-28": 1, "2025-03-06": 1, "2025-03-09": 1, "2025-03-10": 12, "2025-03-11": 3, "2025-03-15": 1, "2025-03-18": 1, "2025-03-22": 1, "2025-04-23": 1, "2025-05-31": 2, "2025-10-05": 1, "2026-06-26": 1, "2026-07-06": 1, "2026-07-07": 1, "2026-07-08": 3, "2026-07-09": 1, "2026-07-10": 1, "2026-07-11": 1, "2026-07-12": 5, "2026-07-13": 1, "2026-07-14": 1, "2026-07-15": 2, "2026-07-17": 1, "2026-07-18": 1, "2026-07-19": 2, "2026-07-21": 1, "2026-07-22": 4, "2026-07-23": 3, "2026-07-24": 7, "2026-07-25": 1, "2026-07-26": 2, "2026-07-27": 4, "2026-07-28": 8, "2026-07-29": 3, "2026-07-30": 2, "2026-07-31": 3, "2026-08-01": 2, "2026-08-04": 8, "2026-08-05": 2, "2026-08-06": 1, "2026-08-07": 1, "2026-08-08": 3, "2026-08-09": 2, "2026-08-10": 3, "2026-08-12": 1, "2026-08-13": 5, "2026-08-14": 3, "2026-08-15": 1, "2026-08-16": 1, "2026-08-17": 4, "2026-08-18": 1, "2026-08-20": 2, "2026-08-21": 1, "2026-08-22": 2, "2026-08-23": 7, "2026-08-25": 4, "2026-08-26": 2, "2026-08-27": 3, "2026-08-29": 2, "2026-08-30": 2, "2026-09-01": 1, "2026-09-02": 1, "2026-09-03": 4, "2026-09-04": 2, "2026-09-05": 2, "2026-09-06": 4, "2026-09-07": 2, "2026-09-08": 4, "2026-09-09": 3, "2026-09-10": 2, "2026-09-11": 2, "2026-09-12": 2, "2026-09-13": 3, "2026-09-14": 1, "2026-09-15": 6, "2026-09-16": 4, "2026-09-17": 13, "2026-09-18": 7, "2026-09-19": 7, "2026-09-20": 2, "2026-09-21": 2, "2026-09-22": 1, "2026-09-23": 3, "2026-09-24": 1, "2026-09-25": 2, "2026-09-26": 1, "2026-09-27": 5, "2026-09-28": 9, "2026-09-29": 2, "2026-10-01": 10, "2026-10-02": 4, "2026-10-03": 8, "2026-10-04": 6, "2026-10-05": 193, "2026-10-06": 8}`.

## Dedup policy

Only simultaneous equality of screenshot SHA-256 **and** DOM SHA-256 against one retained sample skips a live KEEP. Historical samples have priority. Live representatives use the smallest stable candidate ID. URL overlap, one-artifact overlap, hostname overlap and quality flags never automatically remove a sample. Full provenance and review mapping for all KEEP candidates, including skipped aliases, are in `merge_audit.json`.

## Validation

`validation.json` records manifest/directory bijection, artifact hashes, historical preservation, source identities and live KEEP traceability. All original historical artifact bytes are preserved. Raw live captures and review decisions are unchanged. Timestamp metadata refers to URLScan historical capture or Playwright capture, never the Tín Nhiệm Mạng collection time.

## GitHub preparation

`dataset_stats.json` includes storage size, file count, largest files and GitHub size-limit audit. Raw dataset HTML remains private. The separate `F0_clean_share` bundle contains text/plain DOM derivatives with recognized credential patterns redacted and derivative hashes in its manifest. Use that bundle for sharing; do not force-add this raw directory or research/runtime directories. Redaction detects known patterns and is not proof that every possible sensitive value has been identified.

## FINAL acquisition funnel

```json
{
  "live_check_records": 124947,
  "live_check_status_counts": {
    "invalid_url": 2236,
    "dns_error": 36996,
    "live_html": 1782,
    "tls_error": 1212,
    "http_error": 10950,
    "timeout": 70936,
    "connection_error": 800,
    "live_other": 26,
    "redirect_loop": 9
  },
  "deduplicated_candidates": 1579,
  "current_technical_usable": 1191,
  "current_failed_non_usable": 388,
  "review": {
    "total": 1191,
    "pending": 0,
    "keep": 205,
    "reject": 986
  },
  "retained_live": 201,
  "urlscan_retained": 287,
  "current_usable_acquisition_breakdown": {
    "timeout_recovery_salvage": 73,
    "normal": 1110,
    "javascript_disabled_fallback": 2,
    "commit_fallback": 6
  },
  "historical_error_attempts": 880,
  "archived_prior_attempt_reports": 473
}
```

## Strategies and final delta

```json
{
  "capture_strategy_breakdown": {
    "normal": 149,
    "commit_fallback": 6,
    "timeout_recovery_salvage": 44,
    "javascript_disabled_fallback": 2
  },
  "previous_samples": 445,
  "already_represented_keep": 162,
  "new_keep_considered": 43,
  "new_duplicates_skipped": 0,
  "new_samples_merged": 43,
  "capture_year_distribution": {
    "2026": 450,
    "2025": 28,
    "2024": 10
  },
  "http_status_distribution": {
    "200": 201,
    "unknown": 287
  }
}
```

Acquisition stage counts are from current usable reports; overwritten attempts are not added again. Missing historical HTTP status is unknown, never inferred. See final_dataset_summary.json for input hashes/version.

Raw Tín Nhiệm Mạng source records verified from the original input: 124947. Raw source SHA-256 matches live_check/run.json.
