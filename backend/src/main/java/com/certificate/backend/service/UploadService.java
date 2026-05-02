package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.enums.ErrorCode;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class UploadService {

    private final Path root = Paths.get("uploads");

    // Các định dạng ảnh được phép upload
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".png", ".jpg", ".jpeg");

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.FOLDER_CREATE_FAILED);
        }
    }

    public void uploadBackground(MultipartFile file, Long schoolId) {
        try {
            // ✅ Fix 2: Validate file không null, không rỗng
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || !originalFileName.contains(".")) {
                throw new AppException(ErrorCode.FILE_INVALID_FORMAT);
            }

            String extension = originalFileName
                    .substring(originalFileName.lastIndexOf("."))
                    .toLowerCase(); // Chuẩn hóa về thường để so sánh

            // ✅ Fix 2: Chỉ cho phép ảnh, chặn file lạ (.exe, .pdf...)
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new AppException(ErrorCode.FILE_INVALID_FORMAT);
            }

            // ✅ Fix 1: Xóa ảnh cũ (mọi đuôi) trước khi lưu ảnh mới
            deleteExistingBackground(schoolId);

            String filename = "bg_school_" + schoolId + extension;
            Path targetLocation = root.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        } catch (AppException e) {
            throw e; // Không wrap AppException
        } catch (Exception e) {
            throw new AppException(ErrorCode.FILE_SAVE_FAILED);
        }
    }

    public String getBackgroundUri(Long schoolId) {
        String uploadFolderRelativePath = "uploads";

        String fileName = "bg_school_" + schoolId + ".png";

        // Nối đường dẫn và lấy ra đường dẫn tuyệt đối (Absolute Path)
        Path filePath = Paths.get(uploadFolderRelativePath, fileName).toAbsolutePath();

        // Chuyển thành dạng file:///
        String absoluteUri = filePath.toUri().toString();

        // In ra Console để bạn nhìn thấy tận mắt nó trỏ đi đâu
        System.out.println(" [UploadService] Đường dẫn ảnh phôi: " + absoluteUri);

        return absoluteUri;
    }

    // ✅ Helper: Xóa ảnh phôi cũ của trường (tránh tồn đọng bg_school_1.png + bg_school_1.jpg)
    private void deleteExistingBackground(Long schoolId) throws IOException {
        for (String ext : ALLOWED_EXTENSIONS) {
            Path oldFile = root.resolve("bg_school_" + schoolId + ext);
            Files.deleteIfExists(oldFile);
        }
    }
}