package com.certificate.backend.exception;

import com.certificate.backend.model.enums.ErrorCode;

public class AppException extends RuntimeException{
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    // Constructor cho message động (VD: "Trường học ID 5 không tồn tại")
    public AppException(ErrorCode errorCode, String dynamicMessage) {
        super(dynamicMessage);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() { return errorCode; }
}
