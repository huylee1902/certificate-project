package com.certificate.backend.repository;

import com.certificate.backend.model.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

    List<AuditLogEntity> findTop20BySchool_SchoolIdOrderByCreatedAtDesc(Long schoolId);
    //findBySchoolId: Hãy tìm trong entity AuditLog, lấy ra cột school, rồi vào trong SchoolEntity tìm cột nào tên là id
}