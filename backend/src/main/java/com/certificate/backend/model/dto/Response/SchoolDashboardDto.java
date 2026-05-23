package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SchoolDashboardDto {
    private long totalStudents;
    private long issuedCertificates;
    private long revokedCertificates;
    private long pendingStudents;

    private List<MonthlyChart> monthlyChart;
    private List<MajorChart> majorChart;
    private List<RecentActivity> recentActivities;

    @Data
    @Builder
    public static class MonthlyChart {
        private String name;
        private long issued;
        private long revoked;
    }

    @Data
    @Builder
    public static class MajorChart {
        private String name;
        private long value;
    }

    @Data
    @Builder
    public static class RecentActivity {
        private String id;       // Sẽ map với certId
        private String time;     // "10 phút trước"
        private String action;   // "Cấp phát văn bằng"
        private String student;  // "Lê Hoàng Long"
        private String status;   // "SUCCESS" hoặc "REVOKED"
        private String hash;     // "0x7a2b...f89c"
    }
}