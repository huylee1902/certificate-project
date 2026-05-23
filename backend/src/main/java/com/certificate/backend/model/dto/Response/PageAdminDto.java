package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

//Phân trang của admin
@Data
@Builder
public class PageAdminDto<T> {
    private List<T> items;
    private int currentPage;
    private int totalPages;
    private long totalItems;
}
