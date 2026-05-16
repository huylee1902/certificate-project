package com.certificate.backend.repository;

import com.certificate.backend.model.entity.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface CertificateRepository extends JpaRepository<CertificateEntity,Long> {
    //Hãy vào bảng Certificate, tìm biến student, rồi vào trong đối tượng student đó tìm cái biến tên là id
    Optional<CertificateEntity> findByStudentId(Long studentId);

    Optional<CertificateEntity> findByCertId(String certId);

    Optional<CertificateEntity> findByFileHash(String fileHash);

    @Query("SELECT COUNT(c) FROM CertificateEntity c WHERE MONTH(c.issueDate) = :month AND YEAR(c.issueDate) = :year")
    long countCertificatesByMonthAndYear(@Param("month") int month, @Param("year") int year);


}
