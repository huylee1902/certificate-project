package com.certificate.backend.model.entity;

import com.certificate.backend.model.enums.SchoolStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data       // Tự tạo getter, setter
@Table(name = "schools")
public class SchoolEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schoolId")
    private long schoolId;

    @Column(nullable = false)
    private String schoolName;

    @Column(name = "schoolCode")
    private String schoolCode;

    @Column(name = "emailschool",nullable = false, unique = true)
    private String emailSchool;

    private String address;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SchoolStatus status ;

    private String walletAddress;

    @Column(length = 500)
    private String privateKeyEncrypted;

    private Integer totalIssued = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false, unique = true)

    private UserEntity user;

    @OneToMany(mappedBy = "school", fetch = FetchType.LAZY)
    private List<CertificateEntity> certificates;

    public SchoolEntity() {
    }

    public SchoolEntity(String schoolName, String schoolCode, String emailSchool, String address, UserEntity user) {
        this.schoolName = schoolName;
        this.schoolCode = schoolCode;
        this.emailSchool = emailSchool;
        this.address = address;
        this.status = SchoolStatus.PENDING;
        this.walletAddress = null;
        this.privateKeyEncrypted = null;
        this.totalIssued = 0;
        this.user = user;
    }
}
