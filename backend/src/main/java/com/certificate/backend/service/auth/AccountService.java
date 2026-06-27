package com.certificate.backend.service.auth;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.entity.UserEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.UserRepository;
import com.certificate.backend.security.SecurityUserDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AccountService {
    @Autowired
    private OtpService otpService;
    @Autowired
    private SchoolRepository schoolRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private SecurityUserDetail getCurrentUserDetail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (SecurityUserDetail) authentication.getPrincipal();
    }

    public String getCurrentEmail() {
        SecurityUserDetail userDetail = getCurrentUserDetail();
        return userDetail.getUser().getEmail();
    }
    public Map<String, Object> getProfile() {
        Map<String, Object> data = new HashMap<>();
        data.put("email", getCurrentEmail());
        return data;
    }
    public void sendOtp() {
        otpService.sendOtp(getCurrentEmail(),"Mã xác nhận Thay đổi Email - CertiChain",
                "Thay đổi địa chỉ Email");
    }

    @Transactional
    public void verifyAndChangeEmail(String newEmail, String otp) {
        SecurityUserDetail userDetail = getCurrentUserDetail();
        UserEntity user = userDetail.getUser();

        otpService.verifyOtp(getCurrentEmail(), otp);
        otpService.deleteOtp(getCurrentEmail());
        if (userRepository.existsByEmail(newEmail)) {
            throw new AppException(ErrorCode.EMAIL_EXIST);
        }

        user.setEmail(newEmail);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(String oldPassword, String newPassword, String confirmPassword) {
        // 1. Lấy thông tin đối tượng UserEntity đang login từ SecurityContext
        UserEntity currentUser = getCurrentUserDetail().getUser();

        // 2. Kiểm tra mật khẩu cũ nhập vào có khớp với mật khẩu đã mã hóa trong DB không
        if (!passwordEncoder.matches(oldPassword, currentUser.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }

        // 3. Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (!newPassword.equals(confirmPassword)) {
            throw new AppException(ErrorCode.PASSWORD_MISMATCH);
        }

        // 4. Tìm trong DB và cập nhật mật khẩu đã mã hóa mới
        UserEntity userToUpdate = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userToUpdate.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(userToUpdate);
    }
}
