package com.certificate.backend.security;

import com.certificate.backend.model.entity.UserEntity;
import io.jsonwebtoken.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
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
    public String generateAccessToken(UserEntity user) {
        JwtBuilder builder = Jwts.builder()
                            .subject(user.getUserName())
                            .claim("type", "access")
                            .claim("role",user.getRole())
                            .issuedAt(new Date())
                            .expiration(new Date(System.currentTimeMillis() + accessExpiration));
        if (user.getSchool() != null) {
            builder.claim("schoolId", user.getSchool().getSchoolId());
        }
        return builder.signWith(signingKey).compact();
    }

    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public Date extractExpiration(String token){
        Claims claims = parseClaims(token);
        return claims.getExpiration();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            // Bắt buộc phải là access token và thời gian exp phải sau thời gian hiện tại
            return "access".equals(claims.get("type")) && claims.getExpiration().after(new Date());
        } catch (ExpiredJwtException e) {
            System.err.println("Token đã hết hạn: " + e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Token không hợp lệ: " + e.getMessage());
        }
        return false;
    }

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }
    public List<GrantedAuthority> getRolesFromToken(String token) {
        Claims claims = parseClaims(token);
        String role = claims.get("role", String.class);
        return List.of(new SimpleGrantedAuthority(role));
    }
    public Long getSchoolIdFromToken(String token){
        return parseClaims(token).get("schoolId", Long.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
