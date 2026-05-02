package com.certificate.backend.exception;


import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.RowErrorDto;
import com.certificate.backend.model.enums.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler extends RuntimeException {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<?>> handleAppException(AppException ex) {
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(ApiResponse.error(ex.getErrorCode().getHttpStatus(), ex.getMessage()));
    }

    @ExceptionHandler(ImportValidationException.class)
    public ResponseEntity<ApiResponse<?>> handleImportException(ImportValidationException ex) {
        // Tạo response trước để nhét cục data (danh sách lỗi) vào
        ApiResponse<List<RowErrorDto>> response = ApiResponse.error(
                ErrorCode.IMPORT_HAS_ERRORS.getHttpStatus(),
                ErrorCode.IMPORT_HAS_ERRORS.getMessage()
        );
        response.setData(ex.getRowErrors());

        return ResponseEntity
                .status(ErrorCode.IMPORT_HAS_ERRORS.getHttpStatus())
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGeneral(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500,ErrorCode.INTERNAL_ERROR.getMessage()));
    }
}
