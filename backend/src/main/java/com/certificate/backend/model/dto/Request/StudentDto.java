package com.certificate.backend.model.dto.Request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StudentDto {
    @NotBlank(message = "Mã sinh viên không được để trống")
    private String studentId;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Ngày sinh không được để trống")
    @Pattern(regexp = "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/\\d{4}$",
            message = "Ngày sinh phải đúng định dạng dd/MM/yyyy")
    private String dob;

    @NotBlank(message = "Ngành học không được để trống")
    private String major;

    @NotBlank(message = "Xếp loại không được để trống")
    private String degreeType;

    @NotBlank(message = "Hình thức đào tạo không được để trống")
    private String trainingType;

    public String getStudentId() {
        return studentId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getDob() {
        return dob;
    }

    public String getMajor() {
        return major;
    }

    public String getDegreeType() {
        return degreeType;
    }

    public String getTrainingType() {
        return trainingType;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public void setDegreeType(String degreeType) {
        this.degreeType = degreeType;
    }

    public void setTrainingType(String trainingType) {
        this.trainingType = trainingType;
    }
}
