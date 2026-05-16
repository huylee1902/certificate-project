package com.certificate.backend.controller;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.ImportResultDto;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.security.JwtPrincipal;
import com.certificate.backend.service.ImportStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/students")
public class StudentImportController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Autowired
    private ImportStudentService importStudentService;

    @PostMapping("/import")
    public ApiResponse<ImportResultDto> importStudents(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal JwtPrincipal principal) throws Exception {

        validateFile(file); // Ném AppException nếu file không hợp lệ
        ImportResultDto result = importStudentService.importStudents(file, principal.getSchoolId());

        return ApiResponse.success(
                result,
                "Import thành công " + result.getSuccessCount() + " sinh viên vào hệ thống."
        );
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        String name = file.getOriginalFilename();
        if (name == null || (!name.endsWith(".xlsx") && !name.endsWith(".xls"))) {
            throw new AppException(ErrorCode.FILE_INVALID_FORMAT);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.FILE_INVALID_FORMAT, "File không được vượt quá 5MB");
        }
    }
}
