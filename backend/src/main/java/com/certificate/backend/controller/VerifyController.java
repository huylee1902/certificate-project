package com.certificate.backend.controller;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.SearchRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.SearchResponse;
import com.certificate.backend.service.VerifyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/certificates")
public class VerifyController {
    @Autowired
    private VerifyService verifyService;

    @PostMapping("/search")
    public ApiResponse<?> searchCertificate(@Valid @RequestBody SearchRequest request){
        SearchResponse response= verifyService.search(request);
        if(response == null){
            return ApiResponse.error(400,"Không tìm thấy văn bằng!");
        }
        return ApiResponse.success(response,"Tìm kiếm thành công!");
    }

    @PostMapping("/verify")
    public ApiResponse<?> verifyCertificate(@RequestParam("file") MultipartFile file){
        if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
            return ApiResponse.error(400, "Vui lòng tải lên đúng định dạng file PDF!");
        }
        SearchResponse res = verifyService.verify(file);
        if(res == null){
            return ApiResponse.success(400,"Xác thực thất bại!");
        }
        return ApiResponse.success(res,"Xác thực thành công!");
    }

    @GetMapping("/scan")
    public ApiResponse<?> scanCertificate(@RequestParam String certId) {
        SearchResponse res = verifyService.scan(certId.trim());
        if (res == null) {
            return ApiResponse.error(404, "Không tìm thấy văn bằng!");
        }
        return ApiResponse.success(res, "Xác thực thành công!");
    }
}
