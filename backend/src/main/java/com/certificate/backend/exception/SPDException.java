package com.certificate.backend.exception;

public class SPDException extends RuntimeException{
    private final int errorCode;

    public SPDException(int errorCode, String message) {
        super(message);
        this.errorCode=errorCode;
    }

    public int getErrorCode() {
        return errorCode;
    }
}
