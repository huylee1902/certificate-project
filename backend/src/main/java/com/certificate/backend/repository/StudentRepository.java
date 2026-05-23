package com.certificate.backend.repository;

import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.StudentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Set;

@Repository
public interface StudentRepository extends JpaRepository<StudentEntity, Long> {
    @Query("SELECT s.studentId FROM StudentEntity s WHERE s.school = :school")
    public Set<String> findStudentIdsBySchool(@Param("school") SchoolEntity school);

    Long countBySchool_SchoolId(Long schoolId);

    long countBySchool_SchoolIdAndStatus(Long schoolId, Integer status);

    List<StudentEntity> findBySchool_SchoolId(Long schoolId);

    @Query("SELECT s FROM StudentEntity s WHERE s.school.schoolId = :schoolId " +
            "AND (:status IS NULL OR s.status = :status) " +
            "AND (:major IS NULL OR :major = '' OR s.major = :major) " + // ĐÃ THÊM LOGIC NGÀNH HỌC
            "AND (:search IS NULL OR :search = '' OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<StudentEntity> findStudentsWithPagination(
            @Param("schoolId") Long schoolId,
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("major") String major, // Tham số mới
            Pageable pageable);


}
