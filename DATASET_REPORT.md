# F0-v1 selection funnel and exclusions

## Verified funnel and denominators

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

End-to-end live contribution: 201 / 124,947 = 0.160868%. Percentages are computed from integer counts; display rounding may prevent totals from summing to exactly 100%. Historical URLScan contribution is separate, not drawn from the live acceptance denominator. No classification of excluded URLs as benign is implied.

## Live-check exclusion

| Live-check outcome | Records | % of raw reported URLs |
|---|---|---|
| connection_error | 800 | 0.6403% |
| dns_error | 36,996 | 29.6094% |
| http_error | 10,950 | 8.7637% |
| invalid_url | 2,236 | 1.7896% |
| live_html | 1,782 | 1.4262% |
| live_other | 26 | 0.0208% |
| redirect_loop | 9 | 0.0072% |
| timeout | 70,936 | 56.7729% |
| tls_error | 1,212 | 0.9700% |

The outcomes sum to 124,947 source records, with unique source_index values. Only live_html proceeded. DNS, TLS, connection and timeout are acquisition observations, not proof of safety or permanent death. 403, 404 and 5xx responses are retained as distinct HTTP diagnostics; HTTP errors are not rewritten into generic network failure.

### HTTP-error codes

| HTTP status | HTTP-error records |
|---|---|
| 400 | 267 |
| 401 | 10 |
| 402 | 23 |
| 403 | 879 |
| 404 | 8040 |
| 406 | 46 |
| 409 | 7 |
| 410 | 452 |
| 412 | 18 |
| 423 | 2 |
| 429 | 117 |
| 451 | 8 |
| 500 | 330 |
| 502 | 9 |
| 503 | 664 |
| 509 | 5 |
| 520 | 2 |
| 521 | 10 |
| 522 | 1 |
| 523 | 4 |
| 525 | 4 |
| 526 | 39 |
| 530 | 4 |
| 999 | 9 |

## Destination dedup and historical overlap

1,782 live HTML records formed 1,616 normalized-final-URL groups: 166 redundant source records collapsed. 37 groups (2.29%) were skipped on strong normalized source/final URL overlap with historical clean identities, leaving 1,579. These skipped groups contain 48 source records. One overlapping member can exclude its whole shared-destination group; record-level matches must not be mistaken for group counts. Hostname-only and hostname+path-only similarities were audit hints, not automatic removal. All source provenance survives candidate analysis.

## Browser capture and recovery

Current usable: 1,191/1,579 (75.43%); current non-usable: 388 (24.57%). Each candidate is counted once using the latest report and unique completed identity. Historical errors do not override recovered success.

| Successful acquisition stage | Current usable candidates |
|---|---|
| Initial pass (complete + usable partial) | 1129 |
| Recovery pass 2 additional usable | 54 |
| Commit fallback additional usable | 6 |
| No-JS fallback additional usable | 2 |
| Total | 1191 |

Stages are derived from current usable report recovery markers; archived failed attempts are not additional successful samples. This acquisition table covers all reviewable captures, including REJECT; the final strategy table below covers only the retained 201 samples. The timeout/recovery bucket there also includes initial-pass usable timeout partials.

### Evidence categories for current non-usable reports

| Current non-usable evidence category | Candidates |
|---|---|
| browser_stall_after_http | 10 |
| navigation_timeout_with_artifacts | 42 |
| TLS | 97 |
| DNS | 5 |
| connection | 2 |
| browser/process | 0 |
| artifact_only_failure | 217 |
| unknown | 15 |

These mutually exclusive primary labels are computed by the existing browser_stall.classify helper, whose SHA-256 is recorded in selection_funnel.json. They are diagnostic heuristics, not a causal ground truth. Network/process evidence takes precedence. Navigation timeout with artifact evidence is separate from stall-after-HTTP; artifact-only refers to reported navigation completion without technical usability. Unknown means insufficient diagnostic evidence. File presence alone does not guarantee current usable DOM/screenshot; failed attempts may leave older diagnostic files.

### Quality flags observed on reviewable captures

| Observed quality flag | KEEP captures | REJECT captures |
|---|---|---|
| blank_screenshot_suspected | 0 | 233 |
| possible_404 | 0 | 50 |
| possible_challenge | 24 | 16 |
| possible_parking_page | 15 | 16 |
| very_small_dom | 0 | 424 |

Quality flags are non-exclusive; one capture may have multiple flags. These counts use each current report's quality_flags only (excluding summary-derived duplicate annotations). Columns associate flags with final decisions, **not why the reviewer made that decision**. Flags do not automatically reject samples; their sum is not a count of excluded URLs.

## Manual review semantics

1,191 reviewable captures = 205 KEEP (17.212427%) + 986 REJECT (82.787573%) + 0 PENDING. State fields are decision, identity and reviewed_at; no per-candidate reason labels or mutually exclusive reason taxonomy were recorded. Therefore exact manual per-reason counts are unavailable and are not invented. Possible considerations (parking/default/error, incomplete/irrelevant content, changed destinations, low information or insufficient quality/evidence) remain examples, not measured categories. KEEP is project inclusion/quality approval, not independently proven phishing ground truth.

## Final dedup, strategies and composition

205 KEEP resolve to 201 retained live samples + 4 strong duplicate aliases. A strong duplicate requires screenshot AND DOM equality against the same retained sample; one matching artifact/URL/hostname alone is insufficient. merge_audit.json retains every KEEP mapping and provenance.

| Capture strategy | Final live samples | % of final live |
|---|---|---|
| Normal | 149 | 74.13% |
| Timeout/recovery salvage | 44 | 21.89% |
| Commit fallback | 6 | 2.99% |
| JavaScript-disabled fallback | 2 | 1.00% |
| **Total live** | 201 | 100.00% |

Final composition: 287 historical URLScan (58.8115%) + 201 live (41.1885%) = 488. No-JS metadata is preserved; it does not imply equivalent JS-enabled rendering.

## Limitations and traceability

This is a survival/acquisition/quality-selected snapshot, not a random sample of all reported suspicious URLs. Historical availability, live accessibility, capturability and manual judgment bias inclusion; takedown/expired infrastructure may be underrepresented. Reported URLs or exclusion outcomes are not independent maliciousness/benignness labels. See README for snapshot/no-JS/sanitization limitations. selection_funnel.json records source evidence paths/hashes, precise percentages, aggregate decisions and calculation methods; it does not publish raw review state or individual rejection histories.

## Preserved F0-v1 artifact audit

The following original finalization statistics are retained for provenance. Storage statistics refer to the original dataset snapshot, excluding later viewer/documentation additions.


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

### Original dedup policy

Only simultaneous equality of screenshot SHA-256 **and** DOM SHA-256 against one retained sample skips a live KEEP. Historical samples have priority. Live representatives use the smallest stable candidate ID. URL overlap, one-artifact overlap, hostname overlap and quality flags never automatically remove a sample. Full provenance and review mapping for all KEEP candidates, including skipped aliases, are in `merge_audit.json`.

### Original validation

`validation.json` records manifest/directory bijection, artifact hashes, historical preservation, source identities and live KEEP traceability. All original historical artifact bytes are preserved. Raw live captures and review decisions are unchanged. Timestamp metadata refers to URLScan historical capture or Playwright capture, never the Tín Nhiệm Mạng collection time.

### Original GitHub preparation

`dataset_stats.json` includes storage size, file count, largest files and GitHub size-limit audit. Raw dataset HTML remains private. The separate `F0_clean_share` bundle contains text/plain DOM derivatives with recognized credential patterns redacted and derivative hashes in its manifest. Use that bundle for sharing; do not force-add this raw directory or research/runtime directories. Redaction detects known patterns and is not proof that every possible sensitive value has been identified.

### Original acquisition audit

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

### Original merge delta

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
