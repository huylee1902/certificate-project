package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder
public class PageResponseDto<T> {
    private List<T> content;       // Danh sách dữ liệu của trang hiện tại
    private int pageNumber;        // Trang hiện tại (0-indexed)
    private int pageSize;          // Số phần tử trên 1 trang
    private long totalElements;    // Tổng số sinh viên thỏa mãn bộ lọc trong DB
    private int totalPages;        // Tổng số trang
    private boolean last;          // Có phải trang cuối cùng không
}
