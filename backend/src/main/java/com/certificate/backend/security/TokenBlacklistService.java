package com.certificate.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {
    @Autowired
    private StringRedisTemplate redisTemplate;


    public void blacklistToken(String token, long expirationTimeInMillis) {
        long currentTime = System.currentTimeMillis();
        long ttl = expirationTimeInMillis - currentTime;

        // Nếu token vẫn còn hạn thì mới tốn công nén vào Redis
        if (ttl > 0) {
            // Lưu vào Redis với cấu trúc: Key = "BL_eyJhb...", Value = "revoked"
            // Và hẹn giờ tự động xóa (ttl) đúng bằng thời gian sống còn lại của JWT
            redisTemplate.opsForValue().set("BL_" + token, "revoked", ttl, TimeUnit.MILLISECONDS);
            System.out.println("Đã ném Token vào Blacklist. Sẽ tự động dọn rác sau: " + (ttl/1000) + " giây.");
        }
    }

    public boolean isTokenBlacklisted(String token) {
        // Kiểm tra xem Redis có đang chứa Key này không
        return Boolean.TRUE.equals(redisTemplate.hasKey("BL_" + token));
    }

    public void blacklistUser(String username, long durationInMillis) {
        // Ném username vào Redis (Ví dụ: SUSPENDED_USER:truongbkhn)
        redisTemplate.opsForValue().set("SUSPENDED_USER:" + username, "locked", durationInMillis, TimeUnit.MILLISECONDS);
    }

    // HÀM MỚI ĐỂ FILTER KIỂM TRA
    public boolean isUserSuspended(String username) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("SUSPENDED_USER:" + username));
    }

}
