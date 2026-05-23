package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SchoolAnalyticsDto {
    private InfoDTO info;
    private StatsDTO stats;
    private AnalyticsDTO analytics;
    private List<LogDTO> logs;

    @Data @Builder
    public static class InfoDTO {
        private String schoolName;
        private String schoolCode;
        private String status;
        private String schoolAddress;
        private String schoolEmail;
        private String walletAddress;
        private String blockchainStatus;
        private String createdAt;
        private String approvedBy;
        private String approvedAt;
        private String lastLogin;
    }

    @Data @Builder
    public static class StatsDTO {
        private String totalStudents;
        private String totalIssued;
        private String totalRevoked;
        private String revocationRate;
    }

    @Data @Builder
    public static class AnalyticsDTO {
        private List<MajorData> majorData;
        private List<MonthlyData> monthlyData;
    }

    @Data @Builder
    public static class MajorData {
        private String name;
        private long value;
    }

    @Data @Builder
    public static class MonthlyData {
        private String name;
        private int issued;
    }

    @Data @Builder
    public static class LogDTO {
        private Long id;
        private String time;
        private String action;
        private String user;
        private String desc;
    }
}