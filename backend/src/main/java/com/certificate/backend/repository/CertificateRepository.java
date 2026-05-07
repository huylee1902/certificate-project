package com.certificate.backend.repository;

import com.certificate.backend.model.entity.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<CertificateEntity,Long> {

}
