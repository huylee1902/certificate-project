package com.certificate.backend.model.enums;

public enum UserRole {
    SCHOOL,
    ADMIN;

    public String getRoleName() {
        return "ROLE_" + this.name();
    }
}

