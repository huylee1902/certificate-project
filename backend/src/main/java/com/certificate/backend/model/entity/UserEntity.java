package com.certificate.backend.model.entity;

import com.certificate.backend.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


@Entity
@Data       // Tự tạo getter, setter
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userId")
    private long userId ;

    @Column(name = "username", nullable = false, unique = true)
    private  String userName;

    @Column(name = "email" ,nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "activeToken")
    private String activeToken;

    @Column(length = 512)
    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;

    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    @Column(name = "role", nullable = false)
    private String role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SchoolEntity school;

    public UserEntity() {
    }

    public UserEntity(String userName, String email, String password) {
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.role =UserRole.SCHOOL.name();
    }

}
