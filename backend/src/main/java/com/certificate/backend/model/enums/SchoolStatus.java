package com.certificate.backend.model.enums;

public enum SchoolStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED;

    public String getStatusName() {
        return  this.name();
    }
}
