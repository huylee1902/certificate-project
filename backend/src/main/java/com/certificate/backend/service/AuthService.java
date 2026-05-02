package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.AuthInfoModel;
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

    @Transactional
    public void register(RegisterRequest req){
        if(userRepository.existsByUserName(req.getUsername()) || userRepository.existsByEmail(req.getSchoolEmail())){
            throw new AppException(ErrorCode.USERNAME_EXIST);
        }
        if (schoolRepository.existsBySchoolCode(req.getSchoolCode())) {
            throw new AppException(ErrorCode.SCHOOLCODE_EXIST);
        }
        String encodePassword= passwordEncoder.encode(req.getPassword());
        UserEntity newUser= new UserEntity(req.getUsername(),req.getSchoolEmail(),encodePassword);
        userRepository.save(newUser);

        SchoolEntity newSchool = new SchoolEntity(req.getSchoolName(),req.getSchoolCode(),req.getSchoolEmail(),
                                                    req.getSchoolAddress(),newUser);
        schoolRepository.save(newSchool);
    }

    @Transactional
    public AuthInfoModel login(String username, String password){
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
            String role =user.getRole();
            String accessToken=jwtTokenService.generateAccessToken(user.getUserName(),role);
            long expirationTime = jwtTokenService.extractExpiration(accessToken).getTime();

            String refreshToken = jwtTokenService.generateRefreshToken();
            user.setRefreshToken(refreshToken);
            user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
            user.setLastLogin(LocalDateTime.now());
            user.setActiveToken(accessToken);
            userRepository.save(user);
            return new AuthInfoModel(accessToken, refreshToken,user.getUserName(),user.getRole(),expirationTime);
        }
        else{
            throw new AppException(ErrorCode.INVALID_USERNAME);
        }
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
        String role = user.getRole();
        // 3. Tạo Access Token mới
        String newAccessToken = jwtTokenService.generateAccessToken(user.getUserName(),role);
        long expirationTime = jwtTokenService.extractExpiration(newAccessToken).getTime();

        // 4. (Tùy chọn) Rotate Refresh Token - Tạo luôn refresh token mới để tăng bảo mật
        String newRefreshToken = jwtTokenService.generateRefreshToken();
        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        user.setActiveToken(newAccessToken);
        userRepository.save(user);

        return new AuthInfoModel(newAccessToken, newRefreshToken, user.getUserName(), user.getRole(), expirationTime);
    }

    @Transactional
    public void logout(String username){
        UserEntity user = userRepository.findByUserNameOrEmail(username,username)
                .orElseThrow(() -> new AppException(ErrorCode.USERNAME_EXIST));

        user.setActiveToken(null);
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        userRepository.save(user);
    }
}
