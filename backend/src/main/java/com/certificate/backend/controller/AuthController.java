package com.certificate.backend.controller;


import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.ForgotPasswordRequest;
import com.certificate.backend.model.dto.Request.Verify2FAOtp;
import com.certificate.backend.model.dto.Response.AuthInfoModel;
import com.certificate.backend.model.dto.Request.LoginRequest;
import com.certificate.backend.model.dto.Request.RegisterRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.service.auth.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    private static final int AUTHENTICATION_ERROR_CODE = 401;

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody RegisterRequest request){
        authService.register(request);
        return ApiResponse.success("Đăng ký thành công! Vui lòng chờ duyệt.");
    }

    @PostMapping("/login")
    public ApiResponse<?> login(@Valid @RequestBody LoginRequest request) {
        // Hàm này bây giờ chỉ kiểm tra Pass và gửi Email, KHÔNG trả về AuthInfoModel nữa
        authService.login(request.getUsername(), request.getPassword());

        // Báo cho Frontend React biết phải bật form OTP lên
        return ApiResponse.success(null,"OTP_REQUIRED");
    }

    @PostMapping("/verify-otp")
    public ApiResponse<?> verifyOtp(@Valid @RequestBody Verify2FAOtp request, HttpServletResponse response) {

        // 1. Kiểm tra OTP. Đúng thì Service mới nặn ra cục AuthInfoModel
        AuthInfoModel authDto = authService.verifyLoginOtp(request.getEmail(), request.getOtp());

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authDto.getRefreshToken())
                .httpOnly(true)
                .secure(false) // local dev: false, production https: true
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 ngày
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 3. ĐÓNG GÓI TRẢ VỀ DỮ LIỆU CHO REACT (Chỉ trả AccessToken)
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("accessToken", authDto.getAccessToken());
        responseBody.put("username", authDto.getUserName());
        responseBody.put("role", authDto.getRole());
        responseBody.put("expiresIn", authDto.getAccessTokenExpiredAt());

        return ApiResponse.success(responseBody);
    }

    @PostMapping("/refresh")
    public ApiResponse<?> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ApiResponse.error(401, "Thiếu Refresh Token hoặc phiên đăng nhập đã hết hạn!");
        }

        AuthInfoModel authDto = authService.refreshToken(refreshToken);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authDto.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Đổi thành true khi deploy HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 ngày
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // Đóng gói data trả về cho FE (Lưu ý: Không trả refreshToken ra JSON Body nữa)
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("accessToken", authDto.getAccessToken());
        responseBody.put("username", authDto.getUserName());
        responseBody.put("role", authDto.getRole());
        responseBody.put("expiresIn", authDto.getAccessTokenExpiredAt());

        return ApiResponse.success(responseBody);
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken != null && !refreshToken.trim().isEmpty()) {
            authService.logout(refreshToken);
        }

        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) //  Tuổi thọ = 0 -> Xóa Cookie
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return ApiResponse.success("Đăng xuất thành công!");
    }

    @GetMapping("/activate")
    public ApiResponse<?> activateAccount(@RequestParam("token") String token) {
        String message = authService.activateAccount(token);

        return ApiResponse.success(message);
    }

    @PostMapping("/resend-activation")
    public ApiResponse<?> resendActivation(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        authService.resendActivationEmail(email);
        return ApiResponse.success("Liên kết kích hoạt mới đã được gửi vào email của bạn.");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ApiResponse.success("Đã gửi mã OTP");
    }

    // 2. Tự động check mã OTP 6 số
    @PostMapping("/forgot-password/verify")
    public ApiResponse<?> verifyForgotOtp(@RequestBody ForgotPasswordRequest request) {
        authService.verifyResetOtp(request.getEmail(), request.getOtp());
        return ApiResponse.success("Mã OTP hợp lệ");
    }

    // 3. Đổi mật khẩu mới
    @PostMapping("/forgot-password/reset")
    public ApiResponse<?> resetPassword(@RequestBody ForgotPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Đổi mật khẩu thành công");
    }
}
