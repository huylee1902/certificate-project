package com.certificate.backend.service.school.issuse;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.IssueRequest;
import com.certificate.backend.model.dto.Response.IssueResponse;
import com.certificate.backend.model.entity.CertificateEntity;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.StudentEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import com.certificate.backend.service.admin.AuditLogService;
import com.certificate.backend.service.auth.EmailService;
import com.certificate.backend.service.blockchain.BlockchainService;
import com.certificate.backend.service.blockchain.WalletService;
import com.certificate.backend.utils.HashUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;

import java.util.List;

@Slf4j
@Service
public class CertificateService {
    private static final int BLOCKCHAIN_BATCH_LIMIT = 20;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private PdfExportService pdfExportService;

    @Autowired
    private IpfsService ipfsService;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private WalletService walletService;
    @Autowired
    private AuditLogService auditLogService;
    @Autowired
    private EmailService emailService;

    @Value("${app.base-url}")
    private String baseUrl;


    @Transactional
    public void revokeCertificate(Long schoolId, Long studentId, String reason) {
        log.info("=== BẮT ĐẦU THU HỒI VĂN BẰNG CỦA SINH VIÊN ID: {} ===", studentId);

        // 1. Lấy thông tin sinh viên và trường học
        StudentEntity student = studentRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

        SchoolEntity school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        // Kiểm tra xem sinh viên đã được cấp bằng chưa (status == 1)
        if (student.getStatus() != 1) {
            throw new AppException(ErrorCode.CERTIFICATE_NOT_AVAILABLE);
        }

        // 2. Tìm chứng chỉ tương ứng trong DB
        CertificateEntity certificate = certificateRepository.findByStudentId(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.CERTIFICATE_NOT_FOUND));

        String degreeNo = certificate.getCertId();

        // 3. Giải mã Private Key của trường (như lúc cấp bằng)
        String encryptedKey = school.getPrivateKeyEncrypted();
        String realPrivateKey = walletService.decryptPrivateKey(encryptedKey);

        try {

            String txHash = blockchainService.revokeCertificate(realPrivateKey, degreeNo);


            student.setStatus(2);
            studentRepository.save(student);

            certificate.setRevokedAt(LocalDateTime.now());
            certificate.setStatus("REVOKED");
            certificate.setRevokedReason(reason);
            auditLogService.logAction(schoolId,"Thu hồi văn bằng","Thu hồi văn bằng "+degreeNo+"- Lý do: "+ reason,school.getSchoolCode());
            certificateRepository.save(certificate);

            log.info("=== THU HỒI THÀNH CÔNG VĂN BẰNG: {} ===", degreeNo);

        } catch (Exception e) {
            log.error("Thu hồi thất bại: ", e);
            throw new AppException(ErrorCode.REVOKE_FAILED);
        }
    }

    // Cấp bằng
    public IssueResponse issueCertificates(Long schoolId, IssueRequest request) {
        SchoolEntity school = schoolRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        if (school.getRectorName() == null || school.getRectorName().trim().isEmpty()) {
            throw new AppException(ErrorCode.PROFILE_INCOMPLETE);
        }
        IssueResponse resultDto = IssueResponse.builder().build();

        List<StudentEntity> allStudents = studentRepository.findAllById(request.getStudentIds());

        List<StudentEntity> validStudents = new ArrayList<>();

        for (StudentEntity student : allStudents) {
            if (student.getStatus() == 0) {
                validStudents.add(student);
            } else {
                resultDto.addFailure(student.getId(), "Sinh viên không ở trạng thái chờ cấp bằng (Status != 0)");
            }
        }
        if (validStudents.isEmpty()) {
            return resultDto;
        }

        Long currentMaxOrder = certificateRepository.findMaxOrderBySchoolId(schoolId);

        // Mỗi Chunk <= 50
        List<List<StudentEntity>> chunks = partitionIntoChunks(validStudents, BLOCKCHAIN_BATCH_LIMIT);

        // 3. Xử lý từng Chunk
        for (int i = 0; i < chunks.size(); i++) {
            currentMaxOrder = processChunk(schoolId, chunks.get(i),currentMaxOrder,resultDto);
        }

        return resultDto;
    }

    private Long processChunk(Long schoolId, List<StudentEntity> chunkStudents,Long currentMaxOrder, IssueResponse resultDto) {
        List<ChunkItem> items = new ArrayList<>();
        int currentYear = LocalDate.now().getYear();
        Long runningOrder = currentMaxOrder;

        for (StudentEntity student : chunkStudents) {
            runningOrder++;
            ChunkItem item = new ChunkItem(student);
            item.degreeNo = student.getSchool().getSchoolCode()+ "-" + currentYear + "-" + String.format("%04d", runningOrder);
            item.regNo = currentYear + "/" + String.format("%04d", runningOrder);
            item.certificateOrder = runningOrder;
            items.add(item);
        }
        // PDF và IPFS
        for (ChunkItem item : items) {
            try {
                byte[] pdfBytes = pdfExportService.generatePdfBytes(item.student, item.degreeNo, item.regNo);
                item.fileHash = HashUtils.computeSha256(pdfBytes); // băm file pdf vừa sinh ra
                // Upload IPFS
                item.ipfsCid = ipfsService.uploadPdf(pdfBytes, item.degreeNo);
                item.isReadyForBlockchain = true;
            } catch (Exception e) {
                item.isReadyForBlockchain = false;
                resultDto.addFailure(item.student.getId(), "Lỗi PDF/IPFS: " + e.getMessage());
            }
        }

        List<ChunkItem> readyItems = items.stream().filter(item -> item.isReadyForBlockchain).toList();
        if (readyItems.isEmpty()) return runningOrder;

        // BƯỚC 3: Đẩy lên Blockchain (Gom thành 1 Batch)
        String txHash;
        try {
            List<String> degreeNos = readyItems.stream().map(i -> i.degreeNo).toList();
            List<String> studentNames = readyItems.stream().map(i -> i.student.getFullName()).toList();
            List<String> studentIds = readyItems.stream().map(i -> i.student.getStudentId()).toList();
            List<String> degreeTypes = readyItems.stream().map(i -> i.student.getDegreeType()).toList();
            List<String> majors = readyItems.stream().map(i -> i.student.getMajor()).toList();
            List<String> ipfsCids = readyItems.stream().map(i -> i.ipfsCid).toList();

            SchoolEntity school = schoolRepository.findBySchoolId(schoolId)
                    .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

            String schoolPrivateKey = school.getPrivateKeyEncrypted();
            txHash = blockchainService.issueBatch(walletService.decryptPrivateKey(schoolPrivateKey),degreeNos, studentNames ,studentIds, degreeTypes,majors, ipfsCids);

        } catch (Exception e) {
            e.printStackTrace();

            log.error("[Blockchain] Lỗi ghi chunk: {}", e.getMessage());
            readyItems.forEach(i -> resultDto.addFailure(i.student.getId(), "Lỗi Blockchain: " + e.getMessage()));
            return runningOrder;
        }

        saveChunkToDatabase(schoolId,readyItems, txHash, resultDto);
        return runningOrder;
    }

    @Transactional
    protected void saveChunkToDatabase(Long schoolId,List<ChunkItem> items, String txHash, IssueResponse resultDto) {

        for (ChunkItem item : items) {
            try {
                // Lưu vào bảng Chứng chỉ
                CertificateEntity cert = CertificateEntity.builder()
                        .certId(item.degreeNo)
                        .regNo(item.regNo)
                        .certificateOrder(item.certificateOrder)
                        .ipfsHash(item.ipfsCid)
                        .fileHash(item.fileHash)
                        .txHash(txHash)
                        .student(item.student)
                        .school(item.student.getSchool())
                        .issueDate(LocalDateTime.now())
                        .build();
                certificateRepository.save(cert);

                item.student.setStatus(1);
                studentRepository.save(item.student);

                // Ghi nhận thành công

                resultDto.addSuccess(item.student.getId(), item.degreeNo, item.ipfsCid, txHash);
                String verifyLink = baseUrl + "/?certId=" + item.degreeNo;

                if (item.student.getEmail() != null && !item.student.getEmail().isEmpty()) {
                    // Định dạng ngày sinh thành dd/MM/yyyy để hiển thị trên Email cho đẹp
                    String formattedDob = "";
                    if (item.student.getDob() != null) {
                        try {
                            // Thử định dạng nếu dob là kiểu LocalDate/LocalDateTime công thức chuẩn
                            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                            formattedDob = item.student.getDob().format(formatter);
                        } catch (Exception e) {
                            // Nếu dob của bạn đang lưu dạng String sẵn thì gán thẳng luôn
                            formattedDob = item.student.getDob().toString();
                        }
                    }

                    // Gọi EmailService với đầy đủ 2 trường mới bổ sung
                    emailService.sendCertificateIssuedEmail(
                            item.student.getEmail(),
                            item.student.getFullName(),
                            item.student.getStudentId(), // Truyền Mã sinh viên (Vd: B22DCCN065)
                            formattedDob,                // Truyền Ngày sinh (Vd: 21/05/2005)
                            item.degreeNo,
                            item.student.getMajor(),
                            verifyLink
                    );
                }
            } catch (Exception e) {
                resultDto.addFailure(item.student.getId(), "Lỗi lưu DB: " + e.getMessage());
            }
        }
        SchoolEntity school = schoolRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        auditLogService.logAction(
                items.get(0).student.getSchool().getSchoolId(),
                "Cấp bằng",
                "Cấp bằng thành công cho "+resultDto.getSuccessCount()+" sinh viên",school.getSchoolCode());
    }

    private <T> List<List<T>> partitionIntoChunks(List<T> list, int chunkSize) {
        List<List<T>> chunks = new ArrayList<>();
        for (int i = 0; i < list.size(); i += chunkSize) {
            chunks.add(new ArrayList<>(list.subList(i, Math.min(i + chunkSize, list.size()))));
        }
        return chunks;
    }

    // Class phụ hỗ trợ truyền data trong pipeline
    private static class ChunkItem {
        StudentEntity student;
        String degreeNo;
        String regNo;
        String ipfsCid;
        String fileHash;
        Long certificateOrder;
        boolean isReadyForBlockchain = false;

        ChunkItem(StudentEntity student) {
            this.student = student;
        }
    }
}
