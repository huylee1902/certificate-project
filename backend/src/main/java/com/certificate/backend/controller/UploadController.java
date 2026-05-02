package com.certificate.backend.controller;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.service.UploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/schools/{schoolId}")

public class UploadController {
    @Autowired
    private UploadService uploadService;

    @PostMapping("/upload-background")
    public ApiResponse<?> uploadBackground(
            @PathVariable Long schoolId,
            @RequestParam("file") MultipartFile file
    ) {
        // 1. Kiểm tra file rỗng
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_EMPTY);
        }

        // 2. Kiểm tra định dạng (Chỉ cho phép file ảnh)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.FILE_INVALID_FORMAT);
        }

        try {
            // 3. Gọi Service lưu ảnh vào ổ cứng
            uploadService.uploadBackground(file, schoolId);

            return ApiResponse.success("Đã cập nhật phôi bằng mẫu thành công cho nhà trường!");

        } catch (Exception e) {
            // Ném lỗi để GlobalExceptionHandler bắt và chuyển thành ApiResponse báo lỗi
            throw new AppException(ErrorCode.FILE_SAVE_FAILED);
        }
    }
}
