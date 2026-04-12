package com.certificate.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 20, message = "Username phải có từ 3 đến 20 ký tự")
    private String username;


    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Email trường không được để trống")
    @Email(message = "Email trường không hợp lệ")
    private String schoolEmail;

    @NotBlank(message = "Tên trường không được để trống")
    private String schoolName;

    @NotBlank(message = "Mã trường không được để trống")
    private String schoolCode;

    @NotBlank(message = "Địa chỉ trường không được để trống")
    private String schoolAddress;

    public String getUsername() {
        return username;
    }

    public String getSchoolEmail() {
        return schoolEmail;
    }

    public String getPassword() {
        return password;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public String getSchoolCode() {
        return schoolCode;
    }

    public String getSchoolAddress() {
        return schoolAddress;
    }
}
