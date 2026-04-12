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

    @Column(nullable = false, length = 100)
    private String studentName;

    @Column(nullable = false, length = 50)
    private String studentId;

    @Column(length = 50)
    private String degreeType;

    @Column(length = 100)
    private String major;

    @Column(length = 100)
    private String ipfsHash;

    @Column(name="issueDate")
    private LocalDateTime issueDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isValid = true;

    private LocalDateTime revokedAt;
    @Column(length = 500)
    private String revokedReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schoolId",nullable = false)
    private SchoolEntity school;

}
