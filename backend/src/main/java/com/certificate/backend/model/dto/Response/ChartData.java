package com.certificate.backend.model.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChartData {
    private String month; // Ví dụ: "T1", "T2"
    private long totalCert; // Số lượng văn bằng
}
