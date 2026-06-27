package com.certificate.backend.controller;

import com.certificate.backend.model.dto.Request.ChangeEmailRequest;
import com.certificate.backend.model.dto.Request.ChangePasswordRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.service.auth.AccountService;
import com.certificate.backend.service.auth.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {
    private final OtpService otpService;
    private final AccountService accountService;

    // API 1: Gửi OTP về Email cũ
    @PostMapping("/change-email/send-otp")
    public ApiResponse<?> sendOtpChangeEmail() {
        accountService.sendOtp();

        return ApiResponse.success("Gửi mã OTP thành công!");
    }

    @PostMapping("/change-email/verify")
    public ApiResponse<?> verifyAndChangeEmail(@RequestBody ChangeEmailRequest request) {
        accountService.verifyAndChangeEmail(request.getNewEmail(), request.getOtp());

        return ApiResponse.success("Cập nhật địa chỉ email mới thành công!");
    }

    @PostMapping("/change-password")
    public ApiResponse<?> changePassword(@RequestBody ChangePasswordRequest request) {
        accountService.changePassword(
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword()
        );

        return ApiResponse.success("Thay đổi mật khẩu thành công!");
    }
}
