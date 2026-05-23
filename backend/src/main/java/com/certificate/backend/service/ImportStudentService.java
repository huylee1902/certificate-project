package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.exception.ImportValidationException;
import com.certificate.backend.model.dto.Response.ImportResultDto;
import com.certificate.backend.model.dto.Request.StudentDto;
import com.certificate.backend.model.dto.Response.RowErrorDto;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.StudentEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ImportStudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SchoolRepository schoolRepository;
    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private Validator validator;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Transactional
    public ImportResultDto importStudents(MultipartFile file, Long schoolId) throws Exception {
        SchoolEntity school = schoolRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.SCHOOL_NOT_FOUND,
                        "Không tìm thấy trường học!"));

        List<StudentDto> dtoList = parseExcel(file);

        // 3. Validate toàn bộ, gom hết lỗi
        List<RowErrorDto> rowErrors = new ArrayList<>();
        List<StudentEntity> validEntities = new ArrayList<>();

        Set<String> existingIds = studentRepository.findStudentIdsBySchool(school);
        Set<String> seenInFile  = new HashSet<>();

        int rowNumber = 1; // Dòng 0 là tiêu đề, dữ liệu bắt đầu từ dòng 1

        for (StudentDto dto : dtoList) {
            rowNumber++;
            List<String> errors = new ArrayList<>();

            // 2. KÍCH HOẠT VALIDATION CHO DTO
            validator.validate(dto).stream()
                    .map(ConstraintViolation::getMessage)
                    .forEach(errors::add);


            // Duplicate trong chính file
            if (!seenInFile.add(dto.getStudentId())) {
                errors.add(ErrorCode.STUDENT_IN_FILE.getMessage());
            }

            // Duplicate trong DB (chỉ check nếu studentId hợp lệ)
            if (errors.isEmpty() && existingIds.contains(dto.getStudentId())) {
                errors.add(ErrorCode.STUDENT_IN_DB.getMessage());
            }

            if (!errors.isEmpty()) {
                rowErrors.add(new RowErrorDto(rowNumber, dto.getStudentId(), errors));
            } else {
                validEntities.add(mapToEntity(dto, school));
            }

        }

        // 4. All-or-nothing: có 1 lỗi cũng không save
        if (!rowErrors.isEmpty()) {
            throw new ImportValidationException(rowErrors);
        }

        studentRepository.saveAll(validEntities);

        ImportResultDto importResultDto = new ImportResultDto(dtoList.size(),validEntities.size(),rowErrors);
        auditLogService.logAction(schoolId,"Thêm sinh viên","Thêm thành công"+importResultDto.getSuccessCount()+" sinh viên vào hệ thống",school.getSchoolCode());
        return importResultDto;

    }

    private List<StudentDto> parseExcel(MultipartFile file) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<StudentDto> result = new ArrayList<>();
            DataFormatter formatter = new DataFormatter();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                StudentDto dto = new StudentDto();
                dto.setStudentId(getCellValue(row.getCell(1), formatter));
                dto.setFullName(getCellValue(row.getCell(2), formatter));
                dto.setDob(getCellValue(row.getCell(3), formatter));
                dto.setMajor(getCellValue(row.getCell(4), formatter));
                dto.setDegreeType(getCellValue(row.getCell(5), formatter));
                dto.setTrainingType(getCellValue(row.getCell(6), formatter));
                dto.setEmail(getCellValue(row.getCell(7), formatter));
                result.add(dto);
            }
            return result;

        } catch (Exception e) {
            throw new AppException(ErrorCode.FILE_PARSE_ERROR);
        }
    }

    private StudentEntity mapToEntity(StudentDto dto, SchoolEntity school) {
        StudentEntity entity = new StudentEntity();
        entity.setStudentId(dto.getStudentId());
        entity.setFullName(dto.getFullName());
        entity.setDob(LocalDate.parse(dto.getDob(), DATE_FORMATTER));
        entity.setMajor(dto.getMajor());
        entity.setDegreeType(dto.getDegreeType());
        entity.setTrainingType(dto.getTrainingType());
        entity.setEmail(dto.getEmail());
        entity.setSchool(school);
        return entity;
    }

    private String getCellValue(Cell cell, DataFormatter formatter) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            Date date = cell.getDateCellValue();
            // Ép nó về đúng chuẩn chuỗi dd/MM/yyyy của hệ thống mình
            return new SimpleDateFormat("dd/MM/yyyy").format(date);
        }
        return formatter.formatCellValue(cell).trim();
    }
}
