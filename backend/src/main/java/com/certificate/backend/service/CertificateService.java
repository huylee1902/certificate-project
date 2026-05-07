package com.certificate.backend.service;

import com.certificate.backend.model.dto.Request.IssueRequest;
import com.certificate.backend.model.dto.Response.IssueResponse;
import com.certificate.backend.model.entity.CertificateEntity;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.StudentEntity;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CertificateService {
    private static final int BLOCKCHAIN_BATCH_LIMIT = 50;

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

    public IssueResponse issueCertificates(Long schoolId, IssueRequest request) {
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

        // Mỗi Chunk <= 50
        List<List<StudentEntity>> chunks = partitionIntoChunks(validStudents, BLOCKCHAIN_BATCH_LIMIT);

        // 3. Xử lý từng Chunk
        for (int i = 0; i < chunks.size(); i++) {
            processChunk(schoolId, chunks.get(i), resultDto);
        }

        return resultDto;
    }

    private void processChunk(Long schoolId, List<StudentEntity> chunkStudents, IssueResponse resultDto) {
        List<ChunkItem> items = new ArrayList<>();
        int currentYear = LocalDate.now().getYear();

        for (StudentEntity student : chunkStudents) {
            ChunkItem item = new ChunkItem(student);
            item.degreeNo = student.getSchool().getSchoolCode()+ "-" + currentYear + "-" + String.format("%04d", student.getId());
            item.regNo = currentYear + "/" + String.format("%04d", student.getId());
            items.add(item);
        }
        // PDF và IPFS
        for (ChunkItem item : items) {
            try {
                byte[] pdfBytes = pdfExportService.generatePdfBytes(item.student, item.degreeNo, item.regNo);
                // Upload IPFS
                item.ipfsCid = ipfsService.uploadPdf(pdfBytes, item.degreeNo);
                item.isReadyForBlockchain = true;
            } catch (Exception e) {
                item.isReadyForBlockchain = false;
                resultDto.addFailure(item.student.getId(), "Lỗi PDF/IPFS: " + e.getMessage());
            }
        }

        List<ChunkItem> readyItems = items.stream().filter(item -> item.isReadyForBlockchain).toList();
        if (readyItems.isEmpty()) return;

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
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy trường"));

            String schoolPrivateKey = school.getPrivateKeyEncrypted();
            txHash = blockchainService.issueBatch(walletService.decryptPrivateKey(schoolPrivateKey),degreeNos, studentNames ,studentIds, degreeTypes,majors, ipfsCids);

        } catch (Exception e) {
            readyItems.forEach(i -> resultDto.addFailure(i.student.getId(), "Lỗi Blockchain: " + e.getMessage()));
            return;
        }

        saveChunkToDatabase(readyItems, txHash, resultDto);
    }

    @Transactional
    protected void saveChunkToDatabase(List<ChunkItem> items, String txHash, IssueResponse resultDto) {
        for (ChunkItem item : items) {
            try {
                // Lưu vào bảng Chứng chỉ
                CertificateEntity cert = CertificateEntity.builder()
                        .certId(item.degreeNo)
                        .regNo(item.regNo)
                        .ipfsHash(item.ipfsCid)
                        .txHash(txHash)
                        .student(item.student)
                        .issueDate(LocalDateTime.now())
                        .build();
                certificateRepository.save(cert);

                item.student.setStatus(1);
                studentRepository.save(item.student);

                // Ghi nhận thành công
                resultDto.addSuccess(item.student.getId(), item.degreeNo, item.ipfsCid, txHash);
            } catch (Exception e) {
                resultDto.addFailure(item.student.getId(), "Lỗi lưu DB: " + e.getMessage());
            }
        }
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
        boolean isReadyForBlockchain = false;

        ChunkItem(StudentEntity student) {
            this.student = student;
        }
    }
}
