package com.certificate.backend.exception;

import com.certificate.backend.model.dto.Response.RowErrorDto;
import com.certificate.backend.model.enums.ErrorCode;

import java.util.List;

public class ImportValidationException extends RuntimeException {
    private final List<RowErrorDto> rowErrors;

    public ImportValidationException(List<RowErrorDto> rowErrors) {
        super(ErrorCode.IMPORT_HAS_ERRORS.getMessage());
        this.rowErrors = rowErrors;
    }

    public List<RowErrorDto> getRowErrors() {
        return rowErrors;
    }
}
