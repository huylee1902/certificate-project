package com.certificate.backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true,nullable = false,length = 100)
    private String certId;

    @Column(length = 100)
    private String txHash;

    @Column(length = 100)
    private String ipfsHash;

    @Column(name = "file_hash", unique = true)
    private String fileHash;

    @Column(nullable = false, length = 50)
    private String regNo;

    @Column(name="issueDate")
    private LocalDateTime issueDate;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ISSUED";

    private LocalDateTime revokedAt;
    @Column(length = 500)
    private String revokedReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schoolId",nullable = false)
    private SchoolEntity school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studentId", nullable = false)
    private StudentEntity student;

}
