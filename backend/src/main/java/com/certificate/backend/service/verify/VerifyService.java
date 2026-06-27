package com.certificate.backend.service.verify;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.SearchRequest;
import com.certificate.backend.model.dto.Response.SearchResponse;
import com.certificate.backend.model.entity.CertificateEntity;
import com.certificate.backend.model.entity.StudentEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.service.blockchain.BlockchainService;
import com.certificate.backend.utils.HashUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
public class VerifyService {
    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private CertificateRepository certificateRepository;

    @Value("${pinata.gateway.url}")
    private String ipfsGatewayUrl;

    public SearchResponse search(SearchRequest req){
        CertificateEntity certificate = certificateRepository.findByCertId(req.getCertId())
                .orElseThrow(()-> new AppException(ErrorCode.CERTIFICATE_NOT_FOUND));

        StudentEntity student = certificate.getStudent();
        String inputName = req.getFullName().trim().toLowerCase();
        String dbName = student.getFullName().trim().toLowerCase();

        String dbDob = student.getDob().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        if (!inputName.equals(dbName) && !req.getDob().equals(dbDob)){
            throw new AppException(ErrorCode.CERTIFICATE_NOT_FOUND);
        }

        // Truyền thẳng đối tượng CertificateEntity thay vì chỉ truyền certId
        return searchBlockchain(certificate, student, dbDob);
    }

    public SearchResponse verify(MultipartFile file) {
        try {
            // 1. Lấy mảng byte từ file PDF người dùng up lên
            byte[] fileBytes = file.getBytes();

            // 2. TÍNH MÃ HASH BẰNG HÀM SHA-256 CỦA BẠN
            String fileHash = HashUtils.computeSha256(fileBytes);

            // 3. Tìm trong Database xem có file nào mang mã Hash này không
            CertificateEntity certInDb = certificateRepository.findByFileHash(fileHash)
                    .orElseThrow(() -> new AppException(ErrorCode.CERTIFICATE_NOT_FOUND,
                            "CẢNH BÁO: File văn bằng này là GIẢ MẠO hoặc ĐÃ BỊ CHỈNH SỬA!"));

            // 4. Truyền thẳng đối tượng certInDb vào hàm xử lý
            return searchBlockchain(certInDb, certInDb.getStudent(),
                    certInDb.getStudent().getDob().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi xử lý file PDF: ", e);
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Lỗi không xác định khi đọc file PDF.");
        }
    }

    public SearchResponse scan(String certId) {
        CertificateEntity certificate = certificateRepository.findByCertId(certId)
                .orElseThrow(() -> new AppException(ErrorCode.CERTIFICATE_NOT_FOUND));

        StudentEntity student = certificate.getStudent();
        String dobStr = student.getDob().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        // Tái dụng luôn hàm searchBlockchain có sẵn
        return searchBlockchain(certificate, student, dobStr);
    }

    // Hàm phụ trợ chống lỗi NullPointerException (NPE)
    private String getSafeString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }

    // Đổi tham số đầu tiên từ String certId -> CertificateEntity certificate
    private SearchResponse searchBlockchain(CertificateEntity certificate, StudentEntity student, String dobStr){
        // Lấy thông tin từ Smart Contract thông qua certId
        var blockchainInfo = blockchainService.getCertificate(certificate.getCertId());

        if (blockchainInfo == null) {
            throw new AppException(ErrorCode.CERTIFICATE_NOT_FOUND, "Bằng không tồn tại trên Blockchain!");
        }

        SearchResponse res = new SearchResponse();
        res.setStudentName(getSafeString(blockchainInfo, "studentName"));
        res.setMajor(getSafeString(blockchainInfo, "major"));
        res.setDob(dobStr);
        res.setClassification(getSafeString(blockchainInfo, "degreeType"));

        // KIỂM TRA TRẠNG THÁI TỪ BLOCKCHAIN
        boolean isRevoked = (Boolean) blockchainInfo.get("isRevoked");
        res.setStatus(isRevoked ? "REVOKED" : "VALID");

        if(!isRevoked){
            String ipfsHash = getSafeString(blockchainInfo, "ipfsHash");
            String gateway = ipfsGatewayUrl.endsWith("/") ? ipfsGatewayUrl : ipfsGatewayUrl + "/";
            res.setIpfsUrl(gateway + ipfsHash);
        } else {
            // Lấy lý do thu hồi từ Database và gán vào Response DTO
            res.setReasonRevoked(certificate.getRevokedReason());
        }

        return res;
    }
}