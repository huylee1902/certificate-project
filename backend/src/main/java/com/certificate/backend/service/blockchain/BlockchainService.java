package com.certificate.backend.service.blockchain;

import com.certificate.backend.contract.CertificateRegistry;
import com.certificate.backend.exception.AppException;
import com.certificate.backend.exception.BlockchainException;
import com.certificate.backend.model.enums.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tuples.generated.Tuple12;
import org.web3j.tx.Transfer;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.tx.gas.StaticGasProvider;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@Slf4j
public class BlockchainService {
    private final Web3j web3j;
    private final Credentials adminCredentials;
    private final String contractAddress;

    public BlockchainService(
            @Value("${blockchain.node.url}")         String nodeUrl,// node cấu hình khi thực hiện giao dịch
            @Value("${blockchain.admin.key}")  String adminKey,
            @Value("${blockchain.contract.address}") String contractAddress
    ) {
        // Kết nối tới Hardhat node
        this.web3j = Web3j.build(new HttpService(nodeUrl));

        // Credentials của SUPER_ADMIN để ký transaction
        // Đây là ví Account #0 của Hardhat
        this.adminCredentials = Credentials.create(adminKey);

        this.contractAddress = contractAddress;

        log.info("BlockchainService khởi động - Contract: {}", contractAddress);
    }

    public String authorizeSchool(
            String schoolWalletAddress,
            String schoolName,
            String schoolCode
    ) {
        try {
            // Load contract với credentials của superAdmin
            // tạo ra 1 đối tượng "contract" trong RAM với các thông tin ban đầu
            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress,
                    web3j,
                    adminCredentials,
                    new DefaultGasProvider()
            );

            // Gọi hàm authorizeSchool trên smart contract
            var receipt = registry.authorizeSchool(
                    schoolWalletAddress,
                    schoolName,
                    schoolCode
            ).send();
            // .send() = gửi transaction lên blockchain và CHỜ confirm
            // Khác với .sendAsync() = gửi và không chờ
            // receipt chứa: txHash, blockNumber, gasUsed, status

            log.info("authorizeSchool thành công - txHash: {}", receipt.getTransactionHash());
            return receipt.getTransactionHash();

        } catch (Exception e) {
            log.error("authorizeSchool thất bại: {}", e.getMessage());
            throw new BlockchainException("Lỗi authorizeSchool :"+e.getMessage());
        }
    }

    public String suspendSchool(String schoolWalletAddress) {
        try {
            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress, web3j, adminCredentials, new DefaultGasProvider()
            );

            var receipt = registry.suspendSchool(schoolWalletAddress).send();

            log.info("suspendSchool thành công - txHash: {}", receipt.getTransactionHash());
            return receipt.getTransactionHash();

        } catch (Exception e) {
            throw new BlockchainException("Lỗi từ chối trường: "+e.getMessage());
        }
    }

    public String reinstateSchool(String schoolWalletAddress){
        try {
            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress, web3j, adminCredentials, new DefaultGasProvider()
            );

            var receipt = registry.reinstateSchool(schoolWalletAddress).send();

            return receipt.getTransactionHash();

        } catch (Exception e) {
            throw new BlockchainException("Lỗi mở khóa trường:" + e.getMessage());
        }
    }

    public String issueBatch(
            String schoolPrivateKey,
            List<String> certIds,
            List<String> studentNames,
            List<String> studentIds,
            List<String> degreeTypes,
            List<String> majors,
            List<String> ipfsHashes
    ) {
        // Đặt Gas Price (ví dụ 20 Gwei) và Gas Limit cực cao (10 triệu)
        BigInteger GAS_PRICE = BigInteger.valueOf(20_000_000_000L);
        BigInteger GAS_LIMIT = BigInteger.valueOf(10_000_000L); // TĂNG SỐ NÀY LÊN

        StaticGasProvider gasProvider = new StaticGasProvider(GAS_PRICE, GAS_LIMIT);
        try {
            // TẠO CREDENTIALS BẰNG PRIVATE KEY CỦA TRƯỜNG, KHÔNG PHẢI CỦA ADMIN
            Credentials schoolCredentials = Credentials.create(schoolPrivateKey);

            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress, web3j, schoolCredentials,gasProvider
            );

            // Gọi hàm issueCertificateBatch trong Smart Contract của bạn
            var receipt = registry.issueCertificateBatch(
                    certIds, studentNames, studentIds, degreeTypes, majors, ipfsHashes
            ).send();

            if (!receipt.isStatusOK()) {
                throw new AppException(ErrorCode.TRANSACTION_FAILED);
            }

            return receipt.getTransactionHash();

        } catch (Exception e) {
            throw new BlockchainException("Chi tiết lỗi Blockchain: " + e.getMessage(), e);
        }
    }


    public String fundSchoolWallet(String targetWalletAddress, String ethAmount) {
        log.info("Đang xử lý bơm {} ETH cho ví trường: {}", ethAmount, targetWalletAddress);
        try {
            // Hàm Transfer.sendFunds tự động lấy adminCredentials (ví giàu)
            // ký giao dịch chuyển tiền sang targetWalletAddress
            TransactionReceipt receipt = Transfer.sendFunds(
                    web3j,
                    adminCredentials,
                    targetWalletAddress,
                    new BigDecimal(ethAmount),
                    Convert.Unit.ETHER
            ).send();

            if (!receipt.isStatusOK()) {
                throw new BlockchainException("Giao dịch chuyển ETH bị Revert!");
            }

            return receipt.getTransactionHash();

        } catch (Exception e) {
            throw new BlockchainException("Không thể nạp ETH cho ví trường học: " + e.getMessage(), e);
        }
    }

    public String revokeCertificate(String schoolPrivateKey, String certificateId) {
        try {
            // Dùng Private Key của trường để tạo Credentials
            Credentials schoolCredentials = Credentials.create(schoolPrivateKey);

            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress, web3j, schoolCredentials, new DefaultGasProvider()
            );

            // Gọi hàm thu hồi trong Smart Contract
            var receipt = registry.revokeCertificate(certificateId).send();

            if (!receipt.isStatusOK()) {
                throw new BlockchainException("Giao dịch thu hồi bị Blockchain từ chối (Reverted). TxHash: " + receipt.getTransactionHash());
            }

            log.info("Thu hồi thành công văn bằng {} - TxHash: {}", certificateId, receipt.getTransactionHash());
            return receipt.getTransactionHash();

        } catch (Exception e) {
            log.error("Lỗi khi thu hồi văn bằng trên Blockchain: ", e);
            throw new BlockchainException("Lỗi thu hồi Blockchain: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> getCertificate(String certId) {
        try {
            // Load contract bằng quyền Read-only (Dùng ví Admin để đọc dữ liệu public)
            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress, web3j, adminCredentials, new DefaultGasProvider()
            );

            // Gọi hàm verifyCertificate trên Smart Contract
            // Kết quả trả về là một Tuple chứa 12 phần tử (tương ứng 12 biến returns trong Solidity)
            Tuple12<Boolean, Boolean, String, String, String, String, String, String, BigInteger, String, String, String> result
                    = registry.verifyCertificate(certId).send();

            // component1() chính là biến 'found'
            Boolean isFound = result.component1();

            // Nếu found == false, nghĩa là bằng không tồn tại
            if (!isFound) {
                return null;
            }

            // Bóc tách các trường còn lại theo đúng thứ tự trong Solidity
            Boolean isValid = result.component2();
            String studentName = result.component4();
            String degreeType = result.component6();
            String major = result.component7();
            String ipfsHash = result.component8();

            // Đóng gói vào Map trả về cho Controller
            Map<String, Object> info = new HashMap<>();// chứa được nhiều kiểu dữ liệu khác nhau trong cùng một cái Map.
            info.put("studentName", studentName);
            info.put("degreeType", degreeType);
            info.put("major", major);
            info.put("ipfsHash",ipfsHash);

            // CHÚ Ý: Smart Contract dùng 'isValid'.
            // Nếu isValid == false tức là bằng đã bị thu hồi (isRevoked = true).
            info.put("isRevoked", !isValid);

            return info;

        } catch (Exception e) {
            log.error("Lỗi tra cứu Blockchain cho ID {}: {}", certId, e.getMessage());
            return null;
        }
    }
}
