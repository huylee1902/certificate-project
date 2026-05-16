package com.certificate.backend.model.dto.Request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
@Data
public class IssueRequest {
    @NotEmpty(message = "Danh sách sinh viên không được để trống")
    private List<Long> studentIds;

    public List<Long> getStudentIds() {
        return studentIds;
    }
}
