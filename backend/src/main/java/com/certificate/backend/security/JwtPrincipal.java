package com.certificate.backend.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JwtPrincipal {
    private final String username;
    private final Long schoolId; // null nếu là ADMIN
}