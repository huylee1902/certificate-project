package com.certificate.backend.service.auth;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.enums.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;

import org.springframework.stereotype.Service;


import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final StringRedisTemplate redisTemplate;

    private final EmailService emailService;

    private static final String REDIS_OTP_PREFIX = "OTP_SENT_EMAIL:";
    private static final String REDIS_COOLDOWN_PREFIX = "OTP_COOLDOWN:";
    private static final int OTP_EXPIRY_MINUTES= 3;
    private static final int COOLDOWN_SECONDS = 60;

    public void sendOtp(String currentEmail,String subject, String actionName) {

        // 1. KIỂM TRA SPAM (COOLDOWN LOCK) TRƯỚC TIÊN
        String cooldownKey = REDIS_COOLDOWN_PREFIX + currentEmail;
        Long expireTime = redisTemplate.getExpire(cooldownKey, TimeUnit.SECONDS);

        if (expireTime != null && expireTime > 0) {
            throw new RuntimeException("Bạn thao tác quá nhanh. Vui lòng đợi " + expireTime + " giây nữa để gửi lại mã mới!");
        }
        // Tạo OTP ngẫu nhiên
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Lưu vào Redis (Upstash)
        String redisKey = REDIS_OTP_PREFIX + currentEmail;
        redisTemplate.opsForValue().set(redisKey, otp, OTP_EXPIRY_MINUTES, TimeUnit.MINUTES);

        // 4. LƯU KHÓA CHỐNG SPAM (Khóa 60 giây)
        redisTemplate.opsForValue().set(cooldownKey, "LOCKED", COOLDOWN_SECONDS, TimeUnit.SECONDS);
        // Gọi EmailService gửi HTML xịn xò
        emailService.sendOtpEmail(currentEmail, otp,subject, actionName);
    }

    public void verifyOtp(String currentEmail, String inputOtp) {

        String redisKey = REDIS_OTP_PREFIX + currentEmail;

        // Lấy OTP từ Redis
        String cachedOtp = redisTemplate.opsForValue().get(redisKey);

        if (cachedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!cachedOtp.equals(inputOtp)) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

    }

    public void deleteOtp(String email) {
        redisTemplate.delete(REDIS_OTP_PREFIX + email);
    }

}
