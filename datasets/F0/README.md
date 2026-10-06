# Dataset F0-v1

## 1. Tổng quan

F0-v1 gồm **483 mẫu** website từ nguồn báo cáo lừa đảo, được thu thập, chọn lọc và review thủ công để phục vụ đề tài phát hiện website lừa đảo trực tuyến. Mỗi mẫu là một snapshot tại thời điểm capture, không phải chứng nhận rằng website hiện tại vẫn hoạt động hoặc một kết luận độc lập về tính độc hại.

[Mở reviewer chung](https://tien-bap.github.io/scam-website-dataset-f0/reviewer/). Số liệu chi tiết nằm trong [DATASET_REPORT.md](DATASET_REPORT.md) và [selection_funnel.json](selection_funnel.json).

## 2. Thành phần dữ liệu

| Nguồn capture | Số mẫu |
|---|---:|
| URLScan lịch sử | 282 |
| Playwright live | 201 |
| **Tổng** | **483** |

Có 461 hostname nguồn và 451 hostname cuối. Một hostname có thể chứa nhiều trang khác nhau; không loại trùng chỉ dựa vào hostname.

## 3. Nguồn dữ liệu

Nguồn URL ban đầu là danh sách website được báo cáo trên Tín Nhiệm Mạng. Nhánh lịch sử sử dụng artifact URLScan đã được làm sạch và review trước đó. Nhánh live kiểm tra khả năng trả về HTML, loại trùng destination rồi capture bằng Playwright và review thủ công. URLScan và Playwright có thời điểm capture, môi trường và khả năng ghi nhận nội dung khác nhau.

## 4. Quy trình chọn lọc

```text
124.947 URL được báo cáo
        ↓ kiểm tra khả năng trả về HTML
  1.782 bản ghi live_html
        ↓ gộp normalized final URL
  1.616 destination
        ↓ bỏ overlap URL mạnh với bộ lịch sử
  1.579 candidate
        ↓ capture và recovery
  1.191 mẫu có thể review
        ↓ review thủ công
    205 KEEP
        ↓ bỏ 4 mẫu trùng mạnh cả screenshot và DOM
    201 mẫu live duy nhất
        +
    282 mẫu URLScan lịch sử
        =
    483 mẫu F0-v1
```

Từ 1.782 bản ghi đến 1.616 destination là thay đổi đơn vị đếm: nhiều URL nguồn có thể redirect về cùng URL cuối. 37 nhóm destination overlap mạnh với bộ lịch sử không được capture lại. So sánh URL có normalization scheme/hostname, default port, fragment và trailing slash; giữ path và query. Cùng hostname không đủ để tự loại mẫu.

**URL bị loại ≠ URL benign.** Các bước chủ yếu là availability filtering, capture quality filtering, manual review và deduplication. Timeout, lỗi DNS/TLS, HTTP 403/404 hoặc artifact không đủ chất lượng không xác định website là an toàn.

## 5. Kết quả review

Trong 1.191 mẫu live có thể review: 205 KEEP (17,21%), 986 REJECT (82,79%) và không còn PENDING. Sau dedup, 201 mẫu live được giữ. KEEP/REJECT là quyết định đưa snapshot vào dataset dựa trên xem xét thủ công; không phải nhãn đối chứng benign/malicious đã được xác minh độc lập.

Không có taxonomy lý do REJECT được ghi có cấu trúc, nên không suy diễn số lượng lý do từ các cờ heuristic. Public repository chỉ chứa bộ cuối và thống kê tổng hợp, không chứa state hoặc lịch sử quyết định reviewer.

## 6. Các chiến lược capture

| Chiến lược trong 201 mẫu live | Số mẫu | Ý nghĩa |
|---|---:|---|
| `normal` | 149 | Capture thông thường |
| timeout/recovery salvage | 44 | Artifact sử dụng được sau timeout hoặc recovery |
| `commit_fallback` | 6 | Điều hướng tới commit rồi lấy artifact với thời gian chờ giới hạn |
| `javascript_disabled_fallback` | 2 | Context tắt JavaScript để tránh renderer stall; đã xem và review thủ công |

No-JS không mô phỏng đầy đủ hành vi trang khi bật JavaScript. Timeout salvage không đồng nghĩa trang đã load hoàn chỉnh. Các khác biệt này được giữ trong metadata để người sử dụng kiểm tra; reviewer hiển thị friendly label nhưng giữ raw value. Các chiến lược không dùng để tự động KEEP.

## 7. Cấu trúc một sample

```text
samples/<sample_id>/
├── screenshot.png  # Ảnh đã capture
├── dom.txt         # DOM đã sanitize, xem như văn bản thuần
└── report.json     # Metadata capture và provenance đã sanitize
```

`manifest.jsonl` có một bản ghi cho mỗi mẫu. **Các artifact path trong manifest và compact reviewer manifest đều tương đối với dataset root `datasets/F0/`**, ví dụ `samples/<sample_id>/dom.txt`. Tên field JSON giữ nguyên để tương thích. Provenance URL nguồn và metadata recovery trong sample report được bảo toàn.

`dataset_stats.json` là thống kê snapshot F0-v1; phần `storage` chỉ tính các artifact trong `samples/`, không gồm metadata, reviewer hoặc `.git`; `selection_funnel.json` ghi funnel tổng hợp; `validation.json` ghi kết quả kiểm tra. `SHA256SUMS` kiểm chứng toàn bộ file F0 hiện tại, trừ chính file checksum.

## 8. Hạn chế của dataset

- Thiên lệch nguồn báo cáo và lựa chọn thủ công; không đại diện toàn bộ web hoặc mọi loại phishing.
- Live-check và capture chỉ giữ được trang còn khả dụng, nên có availability/survivorship bias.
- Capture lịch sử và live khác thời điểm; website có thể đổi nội dung, đóng cửa hoặc chuyển chủ.
- Challenge, trang parking, trang trắng và redirect có thể làm giảm thông tin. Cờ chất lượng là heuristic, không phải kết luận nguyên nhân hoặc lý do REJECT.
- Snapshot có thể thiếu nội dung động, tài nguyên hoặc tương tác; no-JS đặc biệt hạn chế về hành vi JavaScript.
- Sanitization theo pattern không bảo đảm phát hiện mọi thông tin nhạy cảm; screenshot không được kiểm tra OCR toàn diện. Bản public không nên dùng làm nơi phục hồi token/credential.
- Không có lớp benign đối chứng. Không dùng số mẫu bị loại để suy ra tỷ lệ website an toàn hay hiệu năng mô hình.

## 9. Cách sử dụng

Mở reviewer, chọn dataset F0, tìm theo hostname/URL/mã mẫu và lọc nguồn, chiến lược capture hoặc năm. Chọn screenshot để xem metadata; dùng nút trước/sau hoặc phím mũi tên, Esc để đóng. DOM chỉ tải khi bấm **Xem DOM**, giới hạn bản xem 200 KiB và không thực thi HTML. Link report mở JSON cục bộ.

Kiểm chứng file từ thư mục `datasets/F0/`:

```bash
sha256sum -c SHA256SUMS
```

Khi dùng cho huấn luyện/đánh giá, tránh leakage giữa các trang liên quan bằng cách cân nhắc hostname, provenance và thời điểm capture. Ghi rõ phiên bản F0-v1, nguồn capture, giới hạn nhãn và cách chia tập.

Để thêm F1/F2: tạo thư mục dataset có cùng quy ước artifact path, thêm compact metadata vào `reviewer/data/<id>.json`, rồi đăng ký trong `reviewer/data/datasets.json`. Reviewer đọc registry này, không cần tạo giao diện riêng cho từng bộ dữ liệu. Collection/capture/recovery tooling được giữ ở workspace nghiên cứu local, không thuộc repository public.

## Cập nhật sau manual re-review

Sau khi hoàn tất F0-v1, người dùng xác nhận loại 5 mẫu URLScan historical vì artifact không còn hữu ích (`manual_rereview_artifact_not_useful`). Historical KEEP giảm từ 287 xuống 282, REJECT tăng từ 3.237 lên 3.242. Bộ final còn 282 historical + 201 live = 483 mẫu. Funnel live, 205 KEEP / 986 REJECT và 4 live strong-dedup skips giữ nguyên. **REJECT không đồng nghĩa benign.** Lịch sử quyết định chi tiết được giữ trong audit nội bộ, không đưa artifact bị loại vào public repository.
