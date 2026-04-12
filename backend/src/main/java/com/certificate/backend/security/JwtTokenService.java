package com.certificate.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtTokenService {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private long accessExpiration;

    private SecretKey signingKey;

    // @PostConstruct chạy sau khi @Value đã inject xong
    // Nếu tạo key trong constructor thì secret còn null
    @PostConstruct
    public void init() { //Tạo 1 lần duy nhất khi khởi động, dùng lại mãi
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ── Tạo Access Token ──
    public String generateAccessToken(String username,String role) {
        return Jwts.builder()
                .subject(username)
                .claim("type", "access")    // Đánh dấu loại token
                //PAYLOAD: { "sub": "admin", "type": "access", "iat": 1234, "exp": 5678 }
                // Để phân biệt accessToken và refreshToken
                .claim("role",role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(signingKey)
                .compact();
    }

    // ── Tạo Refresh Token ──
    // RefreshToken chỉ là chuỗi random, không cần JWT
    // Lưu vào DB để kiểm soát - đơn giản và hiệu quả
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public Date extractExpiration(String token){
        Claims claims = parseClaims(token);
        return claims.getExpiration();
    }

    public String validateAccessTokenAndGetUsername(String token) {
        try {
            Claims claims = parseClaims(token);

            // Kiểm tra đúng loại token không
            // Tránh trường hợp dùng refreshToken giả làm accessToken
            if (!"access".equals(claims.get("type"))) {
                return null;
            }
            else{
                String username = claims.getSubject();
                Date expiration = claims.getExpiration();
                if (expiration.after(new Date())) {
                    return username;
                } else {
                    return null;
                }
            }

        } catch (ExpiredJwtException e) {
            System.out.println("Token hết hạn");
            return null;
        } catch (JwtException e) {
            System.out.println("Token không hợp lệ: " + e.getMessage());
            return null;
        }
    }
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
