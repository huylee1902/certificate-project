package com.certificate.backend.model.dto.Request;

import jakarta.validation.constraints.NotBlank;

public class SearchRequest {
    @NotBlank(message = "Không được để trống trường này")
    private String certId;
    @NotBlank(message = "Không được để trống trường này")
    private String fullName;
    @NotBlank(message = "Không được để trống trường này")
    private String dob;

    public String getCertId() {
        return certId;
    }

    public void setCertId(String certId) {
        this.certId = certId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }
}
