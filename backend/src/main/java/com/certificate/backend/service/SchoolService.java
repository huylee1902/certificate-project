package com.certificate.backend.service;

import com.certificate.backend.model.dto.Response.ChartData;
import com.certificate.backend.model.dto.Response.SchoolDto;
import com.certificate.backend.model.dto.Response.DashboardStatsDto;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.SchoolStatus;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SchoolService {
    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    public List<SchoolDto> getAllSchools(){
        List<SchoolEntity> schools = schoolRepository.findAll();
        return schools.stream().map(school -> SchoolDto.builder()
                .id(school.getSchoolId())
                .schoolCode(school.getSchoolCode())
                .schoolName(school.getSchoolName())
                .schoolEmail(school.getUser().getEmail())
                .schoolAddress(school.getAddress())
                .status(school.getStatus())
                .date(school.getUser().getCreatedAt().toString())
                .totalIssued(0) // Sau này nối với count() của CertificateRepo
                .totalRevoked(0)
                .build()
        ).collect(Collectors.toList());
    }

    public DashboardStatsDto getDashboardStats() {
        // Lấy con số tổng quan
        long pending = schoolRepository.countByStatus(SchoolStatus.PENDING);
        long approved = schoolRepository.countByStatus(SchoolStatus.APPROVED);
        long totalCerts = certificateRepository.count(); // Tổng toàn bộ chứng chỉ

        Map<String, Long> stats = new HashMap<>();
        stats.put("pendingSchools", pending);
        stats.put("approvedSchools", approved);
        stats.put("totalCerts", totalCerts);

        // Lấy dữ liệu biểu đồ (6 tháng gần nhất)
        List<ChartData> chartData = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        // Chạy vòng lặp từ 5 tháng trước đến tháng hiện tại
        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            int month = targetMonth.getMonthValue();
            int year = targetMonth.getYear();

            // Gọi repository để đếm
            long count = certificateRepository.countCertificatesByMonthAndYear(month, year);

            // Format tên hiển thị, ví dụ: "T5"
            chartData.add(new ChartData("T" + month, count));
        }

        return DashboardStatsDto.builder()
                .stats(stats)
                .chart(chartData)
                .build();
    }
}
