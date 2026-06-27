package com.certificate.backend.controller;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.ImportResultDto;
import com.certificate.backend.model.dto.Response.PageResponseDto;
import com.certificate.backend.model.dto.Response.StudentResponseDto;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.security.SecurityUserDetail;
import com.certificate.backend.service.school.ImportStudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.certificate.backend.service.StudentService;

import java.security.Principal;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Autowired
    private ImportStudentService importStudentService;
    @Autowired
    private StudentService studentService;

    @PostMapping("/import")
    public ApiResponse<ImportResultDto> importStudents(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal SecurityUserDetail currentUser) throws Exception {
        Long schoolId = currentUser.schoolId();
        validateFile(file);
        ImportResultDto result = importStudentService.importStudents(file, schoolId);
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

    @GetMapping
    public ApiResponse<?> getStudents(
            Principal principal,
            @RequestParam(value = "page",defaultValue = "0") int page,
            @RequestParam(value = "size",defaultValue = "50") int size,
            @RequestParam(value = "search",required = false, defaultValue = "") String search,
            @RequestParam(value = "major", required = false) String major,
            @RequestParam(value = "status",required = false, defaultValue = "all") String status){
        String username = principal.getName();
        PageResponseDto<StudentResponseDto> data = studentService.getStudents(username,page, size, search,major, status);
        return ApiResponse.success(data);
    }

    @GetMapping("/{id}")
    public ApiResponse<?> getStudentDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUserDetail currentUser) {
        return ApiResponse.success(studentService.getStudentDetail(id, currentUser.schoolId()));
    }
}
