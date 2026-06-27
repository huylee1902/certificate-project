package com.certificate.backend.service.blockchain;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.enums.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.*;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
@Slf4j
public class WalletService {

    // AES key 32 ký tự để mã hóa private key
    // Đọc từ application.properties - không hardcode
    @Value("${wallet.encryption.key}")
    private String encryptionKey;

    // ── Tạo ví mới ──
    public WalletInfo createWallet() {
        try {
            // Tạo cặp key ngẫu nhiên
            // ECKeyPair chứa: privateKey + publicKey
            ECKeyPair keyPair = Keys.createEcKeyPair();

            // Lấy private key dạng hex string
            // prependHexPrefix thêm "0x" vào đầu
            String privateKey = "0x" + keyPair.getPrivateKey().toString(16);

            // Tính địa chỉ ví từ public key
            // Keys.getAddress() tự tính theo chuẩn Ethereum
            String walletAddress = "0x" + Keys.getAddress(keyPair);

            // Mã hóa private key trước khi lưu DB
            String encryptedKey = encryptPrivateKey(privateKey);

            log.info("Đã tạo ví mới: {}", walletAddress);

            return WalletInfo.builder()
                    .walletAddress(walletAddress)
                    .privateKey(privateKey)
                    .privateKeyEncrypted(encryptedKey)
                    .build();

        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    // ── Mã hóa private key bằng AES-256 ─────────────
    public String encryptPrivateKey(String privateKey) {
        try {
            // Tạo key AES từ encryptionKey
            SecretKeySpec keySpec = new SecretKeySpec(
                    encryptionKey.getBytes(), "AES"
            );

            // Khởi tạo Cipher với thuật toán AES
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);

            // Mã hóa và encode base64 để lưu DB dạng string
            byte[] encrypted = cipher.doFinal(privateKey.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);

        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    // ── Giải mã private key khi cần dùng ────────────
    public String decryptPrivateKey(String encryptedKey) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(
                    encryptionKey.getBytes(), "AES"
            );

            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, keySpec);

            // Decode base64 rồi giải mã AES
            byte[] decoded = Base64.getDecoder().decode(encryptedKey);
            return new String(cipher.doFinal(decoded));

        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    // ── Inner class chứa thông tin ví ───────────────
    @lombok.Data
    @lombok.Builder
    public static class WalletInfo {
        private String walletAddress;
        private String privateKey;              // Chỉ dùng tạm, không lưu
        private String privateKeyEncrypted;     // Lưu vào DB
    }
}