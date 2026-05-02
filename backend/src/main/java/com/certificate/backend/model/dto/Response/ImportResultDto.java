package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;


public class ImportResultDto {
    private int totalRows;       // Tổng dòng đọc được từ file
    private int successCount;    // Số dòng hợp lệ (= totalRows nếu thành công)
    private List<RowErrorDto> rowErrors; // Rỗng nếu thành công

    public ImportResultDto() {
    }

    public ImportResultDto(int totalRows, int successCount, List<RowErrorDto> rowErrors) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.rowErrors = rowErrors;
    }

    public int getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(int totalRows) {
        this.totalRows = totalRows;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public List<RowErrorDto> getRowErrors() {
        return rowErrors;
    }

    public void setRowErrors(List<RowErrorDto> rowErrors) {
        this.rowErrors = rowErrors;
    }
}
