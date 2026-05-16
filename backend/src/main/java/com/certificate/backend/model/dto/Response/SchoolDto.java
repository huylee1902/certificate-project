package com.certificate.backend.model.dto.Response;

import com.certificate.backend.model.enums.SchoolStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchoolDto {
    private Long id;
    private String schoolCode;
    private String schoolName;
    private String schoolEmail;
    private String schoolAddress;
    private SchoolStatus status;
    private String date; // Ngày đăng ký (định dạng String dd/MM/yyyy)
    private long totalIssued; // Thêm trường này cho Modal chi tiết
    private long totalRevoked;
}
