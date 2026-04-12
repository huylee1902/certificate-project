package com.certificate.backend.service;

import com.certificate.backend.exception.SPDException;
import com.certificate.backend.model.dto.AuthInfoModel;
import com.certificate.backend.model.dto.LoginRequest;
import com.certificate.backend.model.dto.RegisterRequest;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.UserEntity;
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
            throw new SPDException(400,"Tên đăng nhập hoặc email đã tồn tại!");
        }
        if (schoolRepository.existsBySchoolCode(req.getSchoolCode())) {
            throw new SPDException(400, "Mã trường đã tồn tại!");
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
            throw new SPDException(401,"Tài khoản hoặc mật khẩu không chính xác!");
        }
        UserEntity user = userDto.get();

        if(passwordEncoder.matches(password,user.getPassword())){
            if (user.getRole().equals("SCHOOL") ) {
                SchoolEntity school = user.getSchool();

                switch (school.getStatus()) {
                    case PENDING:
                        throw new SPDException(403,
                                "Tài khoản đang chờ duyệt! Vui lòng liên hệ quản trị viên.");
                    case REJECTED:
                        throw new SPDException(403,
                                "Tài khoản bị từ chối.");
                    case SUSPENDED:
                        throw new SPDException(403,
                                "Tài khoản bị khóa tạm thời! Vui lòng liên hệ quản trị viên.");
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
            throw new SPDException(401, "Tài khoản hoặc mật khẩu không chính xác!");
        }
    }

    @Transactional
    public AuthInfoModel refreshToken(String refreshToken) {
        // 1. Tìm user có refresh token này
        UserEntity user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new SPDException(401, "Refresh Token không hợp lệ!"));

        // 2. Kiểm tra thời hạn của Refresh Token
        if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            // Nếu hết hạn thì xóa luôn để bắt đăng nhập lại
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new SPDException(401, "Refresh Token đã hết hạn! Vui lòng đăng nhập lại.");
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
                .orElseThrow(() -> new SPDException(404,"Tên đăng nhập không tồn tại!"));

        user.setActiveToken(null);
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        userRepository.save(user);
    }
}
