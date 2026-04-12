package com.certificate.backend.model.dto;

public class AuthInfoModel {
    private String accessToken;     // dùng để gọi API
    private String refreshToken;    //  dùng để lấy accessToken mới
    private String username;
    private String role;
    private Long accessTokenExpiredAt;

    public AuthInfoModel(String accessToken, String refreshToken, String username, String role, Long accessTokenExpiredAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
        this.accessTokenExpiredAt = accessTokenExpiredAt;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public Long getAccessTokenExpiredAt() {
        return accessTokenExpiredAt;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setAccessTokenExpiredAt(Long accessTokenExpiredAt) {
        this.accessTokenExpiredAt = accessTokenExpiredAt;
    }
}
