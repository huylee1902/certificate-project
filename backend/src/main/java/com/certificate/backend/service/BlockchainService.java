package com.certificate.backend.service;

import com.certificate.backend.contract.CertificateRegistry;
import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.enums.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.DefaultGasProvider;

import java.util.List;


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
            throw new AppException(ErrorCode.INTERNAL_ERROR);
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
            throw new AppException(ErrorCode.INTERNAL_ERROR);
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
            throw new AppException(ErrorCode.INTERNAL_ERROR);
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
        try {
            // TẠO CREDENTIALS BẰNG PRIVATE KEY CỦA TRƯỜNG, KHÔNG PHẢI CỦA ADMIN
            Credentials schoolCredentials = Credentials.create(schoolPrivateKey);

            CertificateRegistry registry = CertificateRegistry.load(
                    contractAddress, web3j, schoolCredentials, new DefaultGasProvider()
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
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }
}
