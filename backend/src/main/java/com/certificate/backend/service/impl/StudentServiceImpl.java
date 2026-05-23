package com.certificate.backend.service.impl;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.IssueRequest;
import com.certificate.backend.model.dto.Response.ImportResultDto;
import com.certificate.backend.model.dto.Response.IssueResponse;
import com.certificate.backend.model.dto.Response.PageResponseDto;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.StudentEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import com.certificate.backend.service.CertificateService;
import com.certificate.backend.service.ImportStudentService;
import com.certificate.backend.service.StudentService;
import com.certificate.backend.model.dto.Response.StudentResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentServiceImpl implements StudentService {
    private final StudentRepository studentRepository;
    private final CertificateRepository certificateRepository;
    private final CertificateService certificateService;
    private final ImportStudentService importStudentService;
    private final SchoolRepository schoolRepository;

    @Override
    public PageResponseDto<StudentResponseDto> getStudents(
            String username, int page, int size, String search,String major, String status) {

        SchoolEntity school = schoolRepository.findByUser_UserName(username)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        Long schoolId = school.getSchoolId();
        // 1. Ánh xạ trạng thái từ chuỗi của FE sang số Integer của BE
        Integer dbStatus = null;
        if ("pending".equals(status)) dbStatus = 0;
        else if ("issued".equals(status)) dbStatus = 1;
        else if ("revoked".equals(status)) dbStatus = 2;

        // 2. Định nghĩa thứ tự hiển thị (Quy ước sắp xếp):
        Pageable pageable = PageRequest.of(page, size, Sort.by(
                Sort.Order.desc("id"),         // Mới import xếp lên trước
                Sort.Order.asc("studentId")    // Cùng mới import thì xếp theo mã sinh viên
        ));

        // 3. Truy vấn phân trang từ Database
        Page<StudentEntity> studentPage = studentRepository.findStudentsWithPagination(
                schoolId, dbStatus, (search == null || search.trim().isEmpty()) ? null : search,major, pageable);

        // 4. Chuyển đổi Entity sang DTO gửi về cho React
        List<StudentResponseDto> dtoList = studentPage.getContent().stream().map(s -> {
            String reactStatus = "pending";
            if (s.getStatus() == 1) reactStatus = "issued";
            else if (s.getStatus() == 2) reactStatus = "revoked";

            return StudentResponseDto.builder()
                    .id(s.getId())
                    .studentId(s.getStudentId())
                    .name(s.getFullName())
                    .email(s.getEmail())
                    .major(s.getMajor())
                    .batch(s.getTrainingType() != null ? s.getTrainingType() : "Chính quy")
                    .status(reactStatus)
                    .build();
        }).collect(Collectors.toList());

        // 5. Đóng gói kết quả phân trang
        return PageResponseDto.<StudentResponseDto>builder()
                .content(dtoList)
                .pageNumber(studentPage.getNumber())
                .pageSize(studentPage.getSize())
                .totalElements(studentPage.getTotalElements())
                .totalPages(studentPage.getTotalPages())
                .last(studentPage.isLast())
                .build();
    }

    @Override
    public ImportResultDto importStudentsFromExcel(MultipartFile file, Long schoolId) throws Exception{
        log.info("Xử lý import Excel cho trường ID: {}", schoolId);
        return importStudentService.importStudents(file,schoolId);
    }

    @Override
    public IssueResponse issueCertificates(Long schoolId, IssueRequest request) {
        log.info("Chuyển tiếp tác vụ Batch Cấp phát sang CertificateService nghiệp vụ...");
        // Gọi hàm phân chunk nhỏ hơn hoặc bằng 50 và ghi Blockchain của bạn
        return certificateService.issueCertificates(schoolId, request);
    }

    @Override
    public void revokeCertificate(Long schoolId, Long studentId, String reason) {
        log.info("Chuyển tiếp tác vụ tước quyền văn bằng sang CertificateService nghiệp vụ...");
        // Gọi hàm thu hồi bằng, cập nhật Smart Contract của bạn
        certificateService.revokeCertificate(schoolId, studentId, reason);
    }
}
