package com.certificate.backend.model.dto.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
@Data
@Builder
public class DashboardStatsDto {
    private Map<String, Long> stats; // Chứa pendingSchools, approvedSchools...
    private List<ChartData> chart;
}
