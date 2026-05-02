package com.certificate.backend.controller;


import com.certificate.backend.model.dto.AuthInfoModel;
import com.certificate.backend.model.dto.LoginRequest;
import com.certificate.backend.model.dto.Request.RegisterRequest;
import com.certificate.backend.model.dto.Request.RefreshTokenRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ApiResponse<?> logout(@AuthenticationPrincipal UserDetails userDetails){
        String username = userDetails.getUsername();
        authService.logout(username);
        return ApiResponse.success("Đăng xuất thành công!");
    }
}
