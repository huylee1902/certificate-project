package com.certificate.backend.model.dto.Request;

import lombok.Data;

import java.util.List;
@Data
public class IssueRequest {
    private List<Long> studentIds;

    public List<Long> getStudentIds() {
        return studentIds;
    }
}
