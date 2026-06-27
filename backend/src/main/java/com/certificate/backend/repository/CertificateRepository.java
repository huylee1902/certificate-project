package com.certificate.backend.repository;

import com.certificate.backend.model.entity.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface CertificateRepository extends JpaRepository<CertificateEntity,Long> {
    //Hãy vào bảng Certificate, tìm biến student, rồi vào trong đối tượng student đó tìm cái biến tên là id
    Optional<CertificateEntity> findByStudentId(Long studentId);

    Optional<CertificateEntity> findByCertId(String certId);

    Optional<CertificateEntity> findByFileHash(String fileHash);

    @Query("SELECT COALESCE(MAX(c.certificateOrder), 0) FROM CertificateEntity c WHERE c.school.schoolId = :schoolId")
    Long findMaxOrderBySchoolId(@Param("schoolId") Long schoolId);

    long countBySchool_SchoolIdAndStatus(Long schoolId, String status);

    List<CertificateEntity> findBySchool_SchoolId(Long schoolId);

    @Query("SELECT COUNT(c) FROM CertificateEntity c WHERE MONTH(c.issueDate) = :month AND YEAR(c.issueDate) = :year")
    long countCertificatesByMonthAndYear(@Param("month") int month, @Param("year") int year);

    List<CertificateEntity> findTop5BySchool_SchoolIdOrderByUpdatedAtDesc(Long schoolId);

    @Query("SELECT c FROM CertificateEntity c WHERE c.school.schoolId = :schoolId AND YEAR(c.issueDate) = YEAR(CURRENT_DATE)")
    List<CertificateEntity> findAllBySchoolThisYear(@Param("schoolId") Long schoolId);

    // THÊM HÀM NÀY: Lấy số lượng bằng đã cấp theo từng chuyên ngành của sinh viên
    @Query("SELECT c.student.major as majorName, COUNT(c.id) as total " +
            "FROM CertificateEntity c " +
            "WHERE c.school.schoolId = :schoolId AND c.status = 'ISSUED' " +
            "GROUP BY c.student.major")
    List<Object[]> countIssuedCertificatesByMajor(@Param("schoolId") Long schoolId);
}
