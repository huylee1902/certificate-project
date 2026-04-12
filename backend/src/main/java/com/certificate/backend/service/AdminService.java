package com.certificate.backend.service;

import com.certificate.backend.exception.SPDException;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.SchoolStatus;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class AdminService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void approveSchool(Long schoolId) {

        // Lấy thông tin trường
        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SPDException(404, "Không tìm thấy trường!"));

        // Chỉ duyệt được trường đang PENDING
        if (school.getStatus() != SchoolStatus.PENDING) {
            throw new SPDException(400,
                    "Trường không ở trạng thái chờ duyệt! Trạng thái hiện tại: "
                            + school.getStatus()
            );
        }

        // ── Bước 1: Tạo ví cho trường ────────────────
        WalletService.WalletInfo wallet = walletService.createWallet();

        // ── Bước 2: Gọi smart contract ────────────────
        // Nếu blockchain lỗi → exception → @Transactional rollback DB
        // → Không bị trạng thái nửa vời
        String txHash = blockchainService.authorizeSchool(
                wallet.getWalletAddress(),
                school.getSchoolName(),
                school.getSchoolCode()
        );

        // ── Bước 3: Cập nhật DB ───────────────────────

        school.setWalletAddress(wallet.getWalletAddress());
        school.setPrivateKeyEncrypted(wallet.getPrivateKeyEncrypted());
        school.setStatus(SchoolStatus.APPROVED);
        schoolRepository.save(school);

    }

    @Transactional
    public void rejectSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SPDException(404, "Không tìm thấy trường!"));

        if (school.getStatus() != SchoolStatus.PENDING) {
            throw new SPDException(400, "Chỉ từ chối được trường đang PENDING!");
        }


        // Từ chối chỉ cập nhật DB, không cần gọi blockchain
        // Vì trường chưa được authorize nên không có gì trên blockchain
        school.setStatus(SchoolStatus.REJECTED);
        schoolRepository.save(school);
    }

    @Transactional
    public void suspendSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SPDException(404, "Không tìm thấy trường!"));

        if (school.getStatus() != SchoolStatus.APPROVED) {
            throw new SPDException(400, "Chỉ khóa được trường đang APPROVED!");
        }

        // ── Bước 1: Gọi smart contract suspendSchool ──
        blockchainService.suspendSchool(school.getWalletAddress());

        // ── Bước 2: Cập nhật DB ───────────────────────
        school.setStatus(SchoolStatus.SUSPENDED);
        schoolRepository.save(school);
    }

    @Transactional
    public void reinstateSchool(Long schoolId) {

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SPDException(404, "Không tìm thấy trường!"));

        if (school.getStatus() != SchoolStatus.SUSPENDED) {
            throw new SPDException(400, "Chỉ mở khóa được trường đang SUSPENDED!");
        }

        // Gọi smart contract reinstateSchool
        blockchainService.reinstateSchool(school.getWalletAddress());

        school.setStatus(SchoolStatus.APPROVED);
        schoolRepository.save(school);

    }
}

