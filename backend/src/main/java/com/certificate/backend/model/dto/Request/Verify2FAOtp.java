package com.certificate.backend.model.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Verify2FAOtp {
    @NotBlank(message = "Username không được để trống")
    private String email;

    @NotBlank(message = "Mã OTP không được để trống")
    private String otp;
}
