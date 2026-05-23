package com.certificate.backend.service;

import com.certificate.backend.model.entity.AuditLogEntity;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.repository.AuditLogRepository;
import com.certificate.backend.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private SchoolRepository schoolRepository;

    // Hàm này sẽ được gọi ở bất cứ đâu có sự kiện thay đổi dữ liệu
    public void logAction(Long schoolId, String actionType, String description, String performedBy) {
        AuditLogEntity log = new AuditLogEntity();
        log.setSchool(schoolRepository.getReferenceById(schoolId));
        log.setActionType(actionType);
        log.setDescription(description);
        log.setPerformedBy(performedBy);
        auditLogRepository.save(log);
    }
}
