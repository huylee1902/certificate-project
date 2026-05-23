package com.certificate.backend.model.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;


import java.time.LocalDate;


@Entity
@Table(name = "students")
@Data
public class StudentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true, nullable = false, length = 50)
    private String studentId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDate dob;

    @Column(length = 100)
    private String major;

    @Column(length = 50)
    private String degreeType;

    @Column(length = 100)
    private String trainingType;

    @Column(nullable = false)
    private Integer status = 0; ; // 0: đang chờ cấp, 1: đã cấp, 2: đã thu hồi

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schoolId", nullable = false)
    private SchoolEntity school;

}
