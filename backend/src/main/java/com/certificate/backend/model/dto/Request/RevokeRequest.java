package com.certificate.backend.model.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class RevokeRequest {
    @NotBlank(message = "Vui lòng nhập lí do thu hồi cho văn bằng này!")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
