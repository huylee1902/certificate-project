package com.certificate.backend.model.dto.Response;


import java.util.List;

public class RowErrorDto {
    private int rowNumber;       // Dòng trong Excel (2, 3, 4...)
    private String studentId;    // Mã SV để user dễ tìm
    private List<String> errors; // Có thể 1 dòng có nhiều lỗi

    public RowErrorDto() {
    }

    public RowErrorDto(int rowNumber, String studentId, List<String> errors) {
        this.rowNumber = rowNumber;
        this.studentId = studentId;
        this.errors = errors;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
}