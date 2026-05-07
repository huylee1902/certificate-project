package com.certificate.backend.repository;

import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.SchoolStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<SchoolEntity, Long> {
    boolean existsBySchoolCode(String schoolCode);

    List<SchoolEntity> findByStatus(SchoolStatus status);

    @Query("SELECT s FROM SchoolEntity s WHERE s.user.userId = :userId")
    Optional<SchoolEntity> findByUserId(@Param("userId") Long userId);

    Optional<SchoolEntity> findBySchoolId(Long schoolId);
}
