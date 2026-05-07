package com.certificate.backend.controller;

import com.certificate.backend.model.dto.Request.IssueRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.IssueResponse;
import com.certificate.backend.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schools/{schoolId}/certificates")
public class CertificateController {
    @Autowired
    private CertificateService certificateService;

    @PostMapping("/issue")
    public ApiResponse<IssueResponse> issueCertificates(
            @PathVariable Long schoolId,
            @RequestBody IssueRequest request) {

        if (request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
            return ApiResponse.error(400, "Danh sách sinh viên không được để trống!");
        }

        IssueResponse result = certificateService.issueCertificates(schoolId,request);

        return ApiResponse.success(result, "Cấp bằng thành công!");
    }
}
