package com.certificate.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class IpfsService {

    // ── Đọc từ application.yml ─────────────────────────────────────────
    @Value("${pinata.jwt}")
    private String pinataJwt;                          // Bearer token từ Pinata dashboard

    @Value("${pinata.api.url:https://api.pinata.cloud/pinning/pinFileToIPFS}")
    private String pinataUploadUrl;

    private final RestTemplate restTemplate;

    public IpfsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Upload 1 file PDF lên IPFS qua Pinata.
     *
     * @param pdfBytes  nội dung file PDF (byte[] từ CertificatePdfGenerator)
     * @param certId    mã văn bằng — dùng làm tên file trên Pinata (dễ tra cứu)
     * @return          ipfsHash (CID) — vd: "QmT5NvUtoM5nWFfrDs..."
     * @throws IpfsUploadException nếu upload thất bại
     */
    public String uploadPdf(byte[] pdfBytes, String certId) {
        log.info("[IPFS] Bắt đầu upload PDF cho văn bằng: {}", certId);

        try {
            // BƯỚC 1: Tạo multipart body
            // Pinata nhận file qua multipart/form-data với field name "file"
            MultiValueMap<String, Object> body = buildMultipartBody(pdfBytes, certId);

            // BƯỚC 2: Tạo header với JWT
            HttpHeaders headers = buildHeaders();

            // BƯỚC 3: Gọi Pinata API
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    pinataUploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            // BƯỚC 4: Lấy IpfsHash từ response JSON
            // Response mẫu: {"IpfsHash":"QmXyz...","PinSize":12345,"Timestamp":"..."}
            String ipfsHash = extractIpfsHash(response);

            log.info("[IPFS] Upload thành công. CertId={} | Hash={}", certId, ipfsHash);
            return ipfsHash;

        } catch (IpfsUploadException e) {
            throw e; // re-throw đã có context
        } catch (Exception e) {
            throw new IpfsUploadException(
                    "Upload IPFS thất bại cho văn bằng: " + certId, e
            );
        }
    }

    /**
     * Tạo multipart body cho Pinata.
     *
     * Pinata yêu cầu 2 field:
     *   - "file"            : nội dung file nhị phân
     *   - "pinataMetadata"  : JSON string chứa tên file (giúp tra cứu trên dashboard)
     */
    private MultiValueMap<String, Object> buildMultipartBody(byte[] pdfBytes, String certId) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Field "file": wrap byte[] thành Resource để Spring set đúng Content-Type
        org.springframework.core.io.ByteArrayResource fileResource =
                new org.springframework.core.io.ByteArrayResource(pdfBytes) {
                    @Override
                    public String getFilename() {
                        // Tên file hiển thị trên Pinata dashboard
                        return "CERT-" + certId + ".pdf";
                    }
                };
        body.add("file", fileResource);

        // Field "pinataMetadata": JSON string (Pinata dùng để đặt tên pin)
        // Format: {"name":"CERT-HUST-2024-001.pdf"}
        String metadata = String.format("{\"name\":\"CERT-%s.pdf\"}", certId);
        body.add("pinataMetadata", metadata);

        return body;
    }

    /**
     * Tạo HttpHeaders:
     *   - Authorization: Bearer {JWT}   ← xác thực Pinata
     *   - Content-Type: multipart/form-data  ← Spring tự set boundary
     */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(pinataJwt);  // "Authorization: Bearer ..."
        return headers;
    }

    /**
     * Trích xuất IpfsHash từ response body của Pinata.
     * Response JSON mẫu:
     * {
     *   "IpfsHash": "QmT5NvUtoM5nWFfrDs...",
     *   "PinSize": 85614,
     *   "Timestamp": "2024-01-15T10:30:00.000Z"
     * }
     */
    @SuppressWarnings("unchecked")
    private String extractIpfsHash(ResponseEntity<Map> response) {
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new IpfsUploadException(
                    "Pinata trả về HTTP " + response.getStatusCode()
            );
        }

        Map<String, Object> responseBody = response.getBody();
        if (responseBody == null || !responseBody.containsKey("IpfsHash")) {
            throw new IpfsUploadException(
                    "Pinata response không có trường IpfsHash. Body: " + responseBody
            );
        }

        String hash = (String) responseBody.get("IpfsHash");
        if (hash == null || hash.isBlank()) {
            throw new IpfsUploadException("IpfsHash rỗng trong response của Pinata");
        }

        return hash;
    }

    // ══════════════════════════════════════════════════════════════════
    // CUSTOM EXCEPTION
    // ══════════════════════════════════════════════════════════════════

    public static class IpfsUploadException extends RuntimeException {
        public IpfsUploadException(String message) {
            super(message);
        }
        public IpfsUploadException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}