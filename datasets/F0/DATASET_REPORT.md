# Báo cáo dataset F0-v1

## Phạm vi và số liệu cuối

Bộ dữ liệu có 483 mẫu: 282 URLScan lịch sử và 201 Playwright live. 483 thư mục sample tương ứng một-một với 483 bản ghi manifest và reviewer. Tài liệu này ghi số liệu tổng hợp, không công bố lịch sử quyết định cá nhân.

## Funnel chọn lọc

| Bước | Số lượng | Diễn giải |
|---|---:|---|
| URL được báo cáo | 124.947 | Bản ghi đầu vào, không phải 124.947 website độc lập |
| `live_html` | 1.782 | Heuristic trả về HTML; không xác minh tính độc hại |
| Normalized final destination | 1.616 | Gộp 166 bản ghi vào các nhóm destination |
| Candidate capture | 1.579 | Loại 37 nhóm overlap mạnh với URL của bộ lịch sử |
| Mẫu có thể review | 1.191 | Artifact đáp ứng điều kiện kỹ thuật sau recovery |
| KEEP thủ công | 205 | 17,21% mẫu có thể review |
| Live cuối sau dedup | 201 | Bỏ 4 mẫu trùng mạnh screenshot và DOM với cùng mẫu được giữ |
| URLScan lịch sử | 282 | Bộ đã review trước đó |
| **F0-v1** | **483** | **282 + 201** |

37 nhóm overlap chứa 48 bản ghi nguồn; đây không phải cùng đơn vị với số nhóm. Chỉ normalized source/final URL overlap mạnh mới tự bỏ; cùng hostname hoặc hostname+path nhưng khác query không đủ để tự bỏ.

## Kết quả live-check

| Trạng thái | Số bản ghi |
|---|---:|
| `connection_error` | 800 |
| `dns_error` | 36.996 |
| `http_error` | 10.950 |
| `invalid_url` | 2.236 |
| `live_html` | 1.782 |
| `live_other` | 26 |
| `redirect_loop` | 9 |
| `timeout` | 70.936 |
| `tls_error` | 1.212 |

HTTP 403 (879 bản ghi) và 404 (8.040 bản ghi) được phân biệt; toàn bộ mã HTTP nằm trong `selection_funnel.json`. Lỗi network, timeout và HTTP không được coi là nhãn benign.

## Capture, recovery và loại trừ kỹ thuật

1.129 mẫu sử dụng được ở pass đầu, 54 mẫu bổ sung từ recovery pass 2, 6 từ commit fallback và 2 từ no-JS: tổng 1.191. Đây là nguồn lần lấy artifact thành công hiện tại; không cộng các lần thử thất bại.

388 candidate chưa có artifact đủ điều kiện review, phân loại theo bằng chứng trong report cuối:

| Nhóm bằng chứng | Số candidate |
|---|---:|
| DNS | 5 |
| TLS | 97 |
| Chỉ thấy artifact không đạt | 217 |
| Browser stall sau HTTP | 10 |
| Lỗi kết nối | 2 |
| Timeout điều hướng có artifact | 42 |
| Không rõ | 15 |

Các nhóm trên là heuristic chẩn đoán, không phải chứng minh quan hệ nhân quả, cũng không phải lý do REJECT thủ công. Không ghi đè bằng lỗi lịch sử khi report mới đã có kết quả.

## Review và cờ chất lượng

205 KEEP, 986 REJECT, 0 PENDING trong 1.191 mẫu live có thể review. Không có taxonomy lý do REJECT có cấu trúc. Cờ chất lượng trong report là không độc quyền (một mẫu có thể mang nhiều cờ):

| Cờ | KEEP | REJECT |
|---|---:|---:|
| `blank_screenshot_suspected` | 0 | 233 |
| `possible_404` | 0 | 50 |
| `possible_challenge` | 24 | 16 |
| `possible_parking_page` | 15 | 16 |
| `very_small_dom` | 0 | 424 |

Không dùng bảng này để suy ra lý do loại mẫu. KEEP là quyết định inclusion/quality, không phải xác minh độc lập malware hay phishing.

## Thành phần capture của bộ cuối

| Chiến lược live | Số mẫu |
|---|---:|
| Thông thường | 149 |
| Timeout/recovery salvage | 44 |
| Commit fallback | 6 |
| No-JS fallback | 2 |

282 mẫu lịch sử chiếm 58,39%; 201 mẫu live chiếm 41,61%. Live cuối chiếm khoảng 0,161% bản ghi URL đầu vào, không phải ước lượng tỷ lệ phishing thực tế.

## Artifact, sanitization và kiểm chứng

Giữ nguyên screenshot, DOM và report public đã sanitize khi chuyển namespace. Không lấy lại artifact từ canonical. Paths manifest tương đối với dataset root. Checksum được tạo lại cho layout mới; xem `SHA256SUMS` và `validation.json`. Manifest public không chứa state/decision history; sample report vẫn giữ provenance cần thiết.

Các hashes bằng chứng xây dựng trong `selection_funnel.json` giúp truy nguyên snapshot đầu vào. Paths bắt đầu bằng `F0/` hoặc `F0_clean/` chỉ mô tả workspace nghiên cứu local, không phải file cần tải trong repository public. Hash của manifest public được cập nhật cho namespace hiện tại. Các bằng chứng raw/review state và merge audit không được công bố ở đây.

Audit pattern bổ sung khi refactor ghi nhận một chuỗi khớp Mapbox đã tồn tại trong DOM public ở commit trước. Artifact được giữ nguyên theo yêu cầu; chuỗi này không được xác minh qua mạng. Các pattern credential khác được kiểm tra không có kết quả. Xem phạm vi và kết quả audit trong `validation.json`; không coi sanitization là bảo đảm loại hết token.

Sanitization dựa trên pattern có giới hạn, đặc biệt với thông tin trong ảnh và secret không thuộc pattern. Không có bảo đảm toàn diện về dữ liệu cá nhân hoặc credential. Reviewer chỉ tải artifact trong repository, DOM là văn bản thuần và không gọi URL nguồn.

## Diễn giải đúng và hạn chế

**URL bị loại ≠ URL benign.** Availability filtering, chất lượng capture, review và dedup làm thay đổi tập dữ liệu; không tạo nhãn benign cho phần bị loại. Nguồn báo cáo, thời điểm capture và chọn lọc thủ công tạo selection bias. URL/hostname có thể thay nội dung theo thời gian. No-JS và timeout salvage có thể ghi nhận ít hành vi hơn trang tương tác đầy đủ. F0-v1 không có bộ đối chứng benign và không đại diện toàn bộ web.

Chi tiết sử dụng và cấu trúc mẫu: [README.md](README.md).

## Cập nhật sau manual re-review

Sau khi hoàn tất F0-v1, người dùng xác nhận loại 5 mẫu URLScan historical vì artifact không còn hữu ích (`manual_rereview_artifact_not_useful`). Historical KEEP giảm từ 287 xuống 282, REJECT tăng từ 3.237 lên 3.242. Bộ final còn 282 historical + 201 live = 483 mẫu. Funnel live, 205 KEEP / 986 REJECT và 4 live strong-dedup skips giữ nguyên. **REJECT không đồng nghĩa benign.** Lịch sử quyết định chi tiết được giữ trong audit nội bộ, không đưa artifact bị loại vào public repository.
