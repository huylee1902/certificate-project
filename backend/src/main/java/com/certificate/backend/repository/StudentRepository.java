package com.certificate.backend.repository;

import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.StudentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface StudentRepository extends JpaRepository<StudentEntity, Long> {
    @Query("SELECT s.studentId FROM StudentEntity s WHERE s.school = :school")
    public Set<String> findStudentIdsBySchool(@Param("school") SchoolEntity school);
}
