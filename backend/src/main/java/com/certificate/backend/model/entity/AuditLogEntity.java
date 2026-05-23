package com.certificate.backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schoolId")
    private SchoolEntity school;

    @Column(name = "action_type")
    private String actionType; // VD: KÍCH HOẠT, KHÓA, CẤP BẰNG, THU HỒI

    @Column(columnDefinition = "TEXT")
    private String description; // Chi tiết hành động

    @Column(name = "performed_by")
    private String performedBy; // Ai làm? (Admin, hoặc Email của Nhà trường)

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}