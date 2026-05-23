package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.model.enums.SchoolStatus;
import com.certificate.backend.repository.SchoolRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
public class AdminService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private BlockchainService blockchainService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private AuditLogService auditLogService;


    @Transactional
    public void approveSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        if (school.getStatus() != SchoolStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_SCHOOL_STATUS,
                    "Trường không ở trạng thái chờ duyệt! Trạng thái hiện tại: "
                            + school.getStatus()
            );
        }

        WalletService.WalletInfo wallet = walletService.createWallet();

        blockchainService.fundSchoolWallet(wallet.getWalletAddress(), "20.0");

        blockchainService.authorizeSchool(
                wallet.getWalletAddress(),
                school.getSchoolName(),
                school.getSchoolCode()
        );

        school.setWalletAddress(wallet.getWalletAddress());
        school.setPrivateKeyEncrypted(wallet.getPrivateKeyEncrypted());
        String token = java.util.UUID.randomUUID().toString();
        school.getUser().setActiveToken(token);
        school.getUser().setActiveTokenExpiry(LocalDateTime.now().plusHours(24));
        school.getUser().setActive(false);

        String activationLink = "http://localhost:5173/activate?token=" + token;

        emailService.sendActivationEmail(
                school.getUser().getEmail(),
                "Xác thực & Kích hoạt tài khoản Hệ thống Văn bằng",
                school.getSchoolName(),
                activationLink
        );
        school.setStatus(SchoolStatus.APPROVED);
        auditLogService.logAction(schoolId,"Duyệt tài khoản","Admin đã duyệt tài khoản tổ chức","System Admin");
        schoolRepository.save(school);

    }

    @Transactional
    public void rejectSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        if (school.getStatus() != SchoolStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_SCHOOL_STATUS, "Chỉ từ chối được trường đang PENDING!");
        }

        school.setStatus(SchoolStatus.REJECTED);
        schoolRepository.save(school);
    }

    @Transactional
    public void suspendSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        if (school.getStatus() != SchoolStatus.APPROVED) {
            throw new AppException(ErrorCode.INVALID_SCHOOL_STATUS, "Chỉ khóa được trường đang APPROVED!");
        }

        blockchainService.suspendSchool(school.getWalletAddress());

        school.setStatus(SchoolStatus.SUSPENDED);
        auditLogService.logAction(schoolId,"Khóa tài khoản","Admin đã khóa tài khoản tổ chức!","System Admin");
        schoolRepository.save(school);
    }

    @Transactional
    public void reinstateSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        if (school.getStatus() != SchoolStatus.SUSPENDED) {
            throw new AppException(ErrorCode.INVALID_SCHOOL_STATUS, "Chỉ mở khóa được trường đang SUSPENDED!");
        }

        blockchainService.reinstateSchool(school.getWalletAddress());

        school.setStatus(SchoolStatus.APPROVED);
        auditLogService.logAction(schoolId,"Mở khóa","Admin đã khóa tài khoản tổ chức!","System Admin");
        schoolRepository.save(school);

    }
}

