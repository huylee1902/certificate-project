package com.certificate.backend.model.dto.Request;

import lombok.Data;

@Data
public class ChangeEmailRequest {
    private String newEmail;
    private String otp;
}
