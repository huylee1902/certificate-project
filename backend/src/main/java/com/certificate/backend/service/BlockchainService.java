package com.certificate.backend.service;

import com.certificate.backend.contract.CertificateRegistry;
import com.certificate.backend.exception.SPDException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.DefaultGasProvider;


@Service
@Slf4j
public class BlockchainService {
    private final Web3j web3j;
    private final Credentials adminCredentials;
    private final String contractAddress;

    public BlockchainService(
            @Value("${blockchain.node.url}")         String nodeUrl,
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
            throw new SPDException(500, "Lỗi kết nối Blockchain khi duyệt trường: " + e.getMessage());
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
            throw new SPDException(500, "Lỗi kết nối Blockchain khi khóa trường: " + e.getMessage());
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
            throw new SPDException(500, "Lỗi kết nối Blockchain khi khóa trường: " + e.getMessage());
        }
    }
}
