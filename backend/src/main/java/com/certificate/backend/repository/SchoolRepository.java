package com.certificate.backend.repository;

import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.SchoolStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolRepository extends JpaRepository<SchoolEntity, Long> {
    boolean existsBySchoolCode(String schoolCode);

    List<SchoolEntity> findByStatus(SchoolStatus status);
}
