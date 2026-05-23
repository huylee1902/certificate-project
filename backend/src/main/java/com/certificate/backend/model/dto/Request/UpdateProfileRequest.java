package com.certificate.backend.model.dto.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Địa chỉ trụ sở không được để trống")
    private String address;

    @NotBlank(message = "Tên Hiệu trưởng không được để trống")
    private String rectorName;
}
