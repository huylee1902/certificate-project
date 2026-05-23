package com.certificate.backend.model.dto.Response;

import lombok.Builder;

@Builder
public class ProfileResponseDto {
    private String schoolName;
    private String schoolCode;
    private String email;
    private String address;
    private String rectorName;

    public ProfileResponseDto() {
    }

    public ProfileResponseDto(String schoolName, String schoolCode, String email, String address, String rectorName) {
        this.schoolName = schoolName;
        this.schoolCode = schoolCode;
        this.email = email;
        this.address = address;
        this.rectorName = rectorName;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getSchoolCode() {
        return schoolCode;
    }

    public void setSchoolCode(String schoolCode) {
        this.schoolCode = schoolCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRectorName() {
        return rectorName;
    }

    public void setRectorName(String rectorName) {
        this.rectorName = rectorName;
    }
}
