package com.certificate.backend.model.dto.Response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDto {
    private Long id;
    private String studentId; // Mã số sinh viên
    private String name;      // Họ và tên
    private String email;
    private String major;     // Ngành học
    private String batch;     // Khóa học (Ví dụ: K65)
    private String status;    // Trạng thái: "pending", "issued", "revoked"
}
