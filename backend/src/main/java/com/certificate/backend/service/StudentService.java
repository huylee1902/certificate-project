package com.certificate.backend.service;

import com.certificate.backend.model.dto.Request.IssueRequest;
import com.certificate.backend.model.dto.Response.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StudentService {
    PageResponseDto<StudentResponseDto> getStudents(
            String username, int page, int size, String search,String major, String status);

    // 2. Import Excel
    ImportResultDto importStudentsFromExcel(MultipartFile file, Long schoolId) throws Exception;

    // 3. Khớp chuẩn kiểu IssueRequest và IssueResponse thực tế của bạn
    IssueResponse issueCertificates(Long schoolId, IssueRequest request);

    // 4. Thu hồi văn bằng
    void revokeCertificate(Long schoolId, Long studentId, String reason);

    StudentDetail getStudentDetail(Long studentId, Long schoolId);
}
