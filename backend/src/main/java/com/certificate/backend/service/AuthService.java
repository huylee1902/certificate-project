package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.ForgotPasswordRequest;
import com.certificate.backend.model.dto.Response.AuthInfoModel;
import com.certificate.backend.model.dto.Request.RegisterRequest;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.UserEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.UserRepository;
import com.certificate.backend.security.JwtTokenService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;
    @Autowired
    private OtpService otpService;

    @Transactional
    public void register(RegisterRequest req){
        if(userRepository.existsByUserName(req.getUsername()) || userRepository.existsByEmail(req.getSchoolEmail())){
            throw new AppException(ErrorCode.USERNAME_EXIST);
        }
        if (schoolRepository.existsBySchoolCode(req.getSchoolCode())) {
            throw new AppException(ErrorCode.SCHOOLCODE_EXIST);
        }
        String encodePassword= passwordEncoder.encode(req.getPassword());
        UserEntity newUser= new UserEntity(req.getUsername(),req.getSchoolEmail(),encodePassword,LocalDateTime.now());

        userRepository.save(newUser);

        SchoolEntity newSchool = new SchoolEntity(req.getSchoolName(),req.getSchoolCode(),req.getSchoolEmail(),
                                                    req.getSchoolAddress(),newUser);
        schoolRepository.save(newSchool);
    }


    public void login(String username, String password){
        Optional<UserEntity> userDto = userRepository.findByUserNameOrEmail(username,username);
        if(userDto.isEmpty()){
            throw new AppException(ErrorCode.INVALID_USERNAME);
        }
        UserEntity user = userDto.get();

        if(passwordEncoder.matches(password,user.getPassword())){
            if (user.getRole().equals("SCHOOL") ) {
                SchoolEntity school = user.getSchool();

                switch (school.getStatus()) {
                    case PENDING:
                        throw new AppException(ErrorCode.ACCOUNT_PENDING);
                    case REJECTED:
                        throw new AppException(ErrorCode.ACCOUNT_REJECTED);
                    case SUSPENDED:
                        throw new AppException(ErrorCode.ACCOUNT_SUSPENDED);
                    case APPROVED:
                        break; // Cho phép đăng nhập
                }
            }
            if(!user.isActive()){
                throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
            }

            otpService.sendOtp(user.getEmail());
        }
        else{
            throw new AppException(ErrorCode.INVALID_USERNAME);
        }
    }

    @Transactional
    public AuthInfoModel verifyLoginOtp(String username, String otp) {
        // Lấy lại user
        UserEntity user = userRepository.findByUserNameOrEmail(username, username)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_USERNAME));

        // Kiểm tra OTP bằng Redis (Sai OTP sẽ văng lỗi ngay trong hàm này)
        otpService.verifyOtp(user.getEmail(), otp);
        otpService.deleteOtp(user.getEmail());

        String accessToken = jwtTokenService.generateAccessToken(user);
        long expirationTime = jwtTokenService.extractExpiration(accessToken).getTime();

        String refreshToken = jwtTokenService.generateRefreshToken();
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        user.setLastLogin(LocalDateTime.now());

        userRepository.save(user);

        return new AuthInfoModel(accessToken, refreshToken, user.getUserName(), user.getRole(), expirationTime);
    }

    @Transactional
    public AuthInfoModel refreshToken(String refreshToken) {
        // 1. Tìm user có refresh token này
        UserEntity user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REFRESH_TOKEN));

        // 2. Kiểm tra thời hạn của Refresh Token
        if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            // Nếu hết hạn thì xóa luôn để bắt đăng nhập lại
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new AppException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        // 3. Tạo Access Token mới
        String newAccessToken = jwtTokenService.generateAccessToken(user);
        long expirationTime = jwtTokenService.extractExpiration(newAccessToken).getTime();

        // 4. (Tùy chọn) Rotate Refresh Token - Tạo luôn refresh token mới để tăng bảo mật
        String newRefreshToken = jwtTokenService.generateRefreshToken();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));

        userRepository.save(user);

        return new AuthInfoModel(newAccessToken, newRefreshToken, user.getUserName(), user.getRole(), expirationTime);
    }

    @Transactional
    public void logout(String refreshToken){
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return;
        }
        Optional<UserEntity> userOptional = userRepository.findByRefreshToken(refreshToken);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);

            userRepository.save(user);
        }
    }

    @Transactional
    public String activateAccount(String token){
        Optional<UserEntity> userOpt = userRepository.findByActiveToken(token);

        if (userOpt.isEmpty()) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        UserEntity user = userOpt.get();

        if (user.isActive() ) {
            user.setActiveToken(null);
            user.setActiveTokenExpiry(null);
            userRepository.save(user);
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_ACTIVATED);
        }

        if (user.getActiveTokenExpiry() != null && user.getActiveTokenExpiry().isBefore(LocalDateTime.now())) {
            // Có thể xóa token hết hạn đi cho sạch DB
            user.setActiveToken(null);
            user.setActiveTokenExpiry(null);
            userRepository.save(user);
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        user.setActive(true);
        user.setActiveToken(null);
        user.setActiveTokenExpiry(null);

        userRepository.save(user);

        return "Kích hoạt tài khoản thành công!";

    }


    public String resendActivationEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.isActive()) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_ACTIVATED);
        }

        String newToken = java.util.UUID.randomUUID().toString();
        user.setActiveToken(newToken);
        user.setActiveTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        String activationLink = "http://localhost:5173/activate?token=" + newToken;

        emailService.sendActivationEmail(
                 user.getEmail(),
                 "Gửi lại: Xác thực & Kích hoạt tài khoản Hệ thống Văn bằng",
                 user.getSchool().getSchoolName(),
                 activationLink
         );

        return "Đã gửi lại email kích hoạt. Vui lòng kiểm tra hộp thư của bạn.";
    }

    public void forgotPassword(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        otpService.sendOtp(user.getEmail());
    }

    public void verifyResetOtp(String email, String otp) {
        if (otp == null || otp.isBlank()) throw new AppException(ErrorCode.OTP_INVALID);
        otpService.verifyOtp(email, otp);
    }

    public void resetPassword(ForgotPasswordRequest request) {
        // 1. Tự check Null cho 2 trường mật khẩu
        if (request.getNewPassword() == null || request.getConfirmPassword() == null) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }

        // 2. Check Confirm Password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        // 3. Check OTP lần cuối
        otpService.verifyOtp(request.getEmail(), request.getOtp());

        // 4. Lưu DB
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 5. Xóa OTP
        otpService.deleteOtp(request.getEmail());
    }
}
