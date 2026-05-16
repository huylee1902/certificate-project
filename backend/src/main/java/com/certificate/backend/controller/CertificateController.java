package com.certificate.backend.controller;

import com.certificate.backend.model.dto.Request.IssueRequest;
import com.certificate.backend.model.dto.Request.RevokeRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.IssueResponse;
import com.certificate.backend.security.JwtPrincipal;
import com.certificate.backend.service.CertificateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @PostMapping("/issue")
    public ApiResponse<IssueResponse> issueCertificates(
            @AuthenticationPrincipal JwtPrincipal principal,
            @Valid @RequestBody IssueRequest request) {

        IssueResponse result = certificateService.issueCertificates(
                principal.getSchoolId(), request);

        String message;
        if (result.getFailureCount() == 0) {
            message = "Cấp phát văn bằng thành công toàn bộ!";
        } else if (result.getSuccessCount() > 0) {
            message = "Đã cấp xong, nhưng có " + result.getFailureCount() + " trường hợp bị lỗi!";
        } else {
            message = "Cấp phát thất bại toàn bộ! Vui lòng xem chi tiết.";
        }

        return ApiResponse.success(result, message);
    }

    @PostMapping("/revoke/{studentId}")
    public ApiResponse<?> revokeCertificate(
            @AuthenticationPrincipal JwtPrincipal principal,
            @PathVariable Long studentId,
            @Valid @RequestBody RevokeRequest request) {

        certificateService.revokeCertificate(
                principal.getSchoolId(), studentId, request.getReason());

        return ApiResponse.success(null, "Đã thu hồi văn bằng thành công!");
    }
}