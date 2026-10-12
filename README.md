# Kho dữ liệu website lừa đảo

Repository này lưu trữ, quản lý và review các bộ dữ liệu phục vụ đề tài phát hiện website lừa đảo trực tuyến. Đối tượng sử dụng là sinh viên, giảng viên hướng dẫn và các thành viên trong nhóm.

## Bộ dữ liệu hiện có

| Dataset | Số mẫu | Mô tả |
|---|---:|---|
| [F0-v1](datasets/F0/README.md) | 483 | Website từ nguồn báo cáo lừa đảo, đã thu thập, làm sạch và review |

## Reviewer

[🔎 Mở Dataset Reviewer](https://tien-bap.github.io/scam-website-dataset-f0/reviewer/)

Reviewer chung cho các dataset hỗ trợ xem screenshot, URL, metadata, nguồn dữ liệu, chiến lược capture, DOM và provenance. Đây là giao diện chỉ xem, không chỉnh sửa quyết định review và không truy cập website trong dữ liệu.

## Cấu trúc repository

```text
datasets/
└── F0/       # Dữ liệu, manifest và tài liệu F0-v1
reviewer/     # Giao diện chung cho F0, F1, F2…
```
