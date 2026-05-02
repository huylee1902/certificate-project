package com.certificate.backend.controller;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import com.certificate.backend.model.entity.StudentEntity;
import com.certificate.backend.service.PdfExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/schools/{schoolId}/certificates")
public class PdfExportController {

    @Autowired
    private PdfExportService pdfExportService;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private SchoolRepository schoolRepository;

    @GetMapping("/export/{studentId}")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long schoolId,
                                            @PathVariable Long studentId){
        try {

            StudentEntity student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

            if (student.getSchool().getSchoolId()!=schoolId) {
                throw new RuntimeException("Sinh viên này không thuộc quyền quản lý của trường!");
            }

            Optional<SchoolEntity> school = schoolRepository.findById(schoolId);
            if(school.isEmpty()){
                throw new AppException(ErrorCode.SCHOOL_NOT_FOUND);
            }

            byte[] pdfBytes = pdfExportService.generatePdfBytes(student, schoolId);

            // 3. Cấu hình Header để Trình duyệt nhận diện đây là file PDF
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            // Dùng "inline" để xem trực tiếp trên tab trình duyệt (đổi thành "attachment" nếu muốn tải về máy)
            headers.setContentDispositionFormData("inline", "cert_" +school.get().getSchoolCode() +"_" + student.getStudentId() + ".pdf");

            // 4. Trả file về cho người dùng
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            // Nếu có lỗi (VD: thiếu font, sai file mẫu...), in ra dạng text để dễ debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(("Lỗi khi tạo PDF: " + e.getMessage()).getBytes());
        }
    }
}
