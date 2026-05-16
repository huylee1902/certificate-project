package com.certificate.backend.controller;


import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.AuthInfoModel;
import com.certificate.backend.model.dto.Request.LoginRequest;
import com.certificate.backend.model.dto.Request.RegisterRequest;
import com.certificate.backend.model.dto.Request.RefreshTokenRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

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
    public ApiResponse<?> login(@Valid @RequestBody LoginRequest request){
        AuthInfoModel authDto=authService.login(request.getUsername(),request.getPassword());
        if(authDto == null){
            return ApiResponse.error(AUTHENTICATION_ERROR_CODE, "Tên đăng nhập hoặc mật khẩu không đúng");
        }
        return ApiResponse.success(authDto);
    }

    @PostMapping("/refresh")
    public ApiResponse<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        // Gọi hàm xử lý logic từ AuthService
        AuthInfoModel authDto = authService.refreshToken(request.getRefreshToken());

        // Trả về bộ Token mới (Access Token và Refresh Token mới)
        return ApiResponse.success(authDto);
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ApiResponse.error(401, "Thiếu token hoặc token không đúng định dạng!");
        }

        // Bóc tách lấy đúng chuỗi token
        String token = authHeader.substring(7);

        // ĐẨY TOÀN BỘ LOGIC XUỐNG SERVICE CỦA BẠN
        authService.logout(token);

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
}
