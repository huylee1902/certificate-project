package com.certificate.backend.model.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    // Các trường dưới đây không dùng @NotBlank,
    // ta sẽ tự check tay ở Service khi cần thiết.
    private String otp;
    private String newPassword;
    private String confirmPassword;
}
