package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.dto.Request.UpdateProfileRequest;
import com.certificate.backend.model.dto.Response.*;
import com.certificate.backend.model.entity.AuditLogEntity;
import com.certificate.backend.model.entity.CertificateEntity;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.entity.UserEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.model.enums.SchoolStatus;
import com.certificate.backend.repository.AuditLogRepository;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
// ADMIN
@Service
public class SchoolService {
    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private CertificateRepository certificateRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private AuditLogService auditLogService;

   public PageAdminDto<SchoolDto> getSchools(String keyword, String status, int page, int size){
       // Chuyển trang của Frontend (bắt đầu từ 1) sang Spring Data (bắt đầu từ 0)
       Pageable pageable = PageRequest.of(page - 1, size);

       // Xử lý logic lọc
       String actualStatus = "ALL".equalsIgnoreCase(status) ? null : status;
       String actualKeyword = (keyword == null || keyword.trim().isEmpty()) ? null : keyword.trim();

       // Gọi DB
       Page<SchoolEntity> schoolPage = schoolRepository.searchAndFilterSchools(actualKeyword, actualStatus, pageable);

        List<SchoolDto> dtoList = schoolPage.getContent().stream()
                .map(entity -> SchoolDto.builder()
                        .id(entity.getSchoolId())
                        .schoolCode(entity.getSchoolCode())
                        .schoolName(entity.getSchoolName())
                        .schoolEmail(entity.getUser().getEmail())
                        .schoolAddress(entity.getAddress())
                        .status(entity.getStatus())
                        .totalIssued(0)
                        .totalRevoked(0)
                        .build()
                ).toList();

       // Đóng gói vào PageResponse
       return PageAdminDto.<SchoolDto>builder()
               .items(dtoList)
               .currentPage(page)
               .totalPages(schoolPage.getTotalPages())
               .totalItems(schoolPage.getTotalElements())
               .build();

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

    public SchoolAnalyticsDto getSchoolAnalytics(Long schoolId) {

        SchoolEntity school = schoolRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        UserEntity user = school.getUser();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        // KHỐI 1: INFO (THÔNG TIN CHUNG & TÀI KHOẢN)
        SchoolAnalyticsDto.InfoDTO info = SchoolAnalyticsDto.InfoDTO.builder()
                .schoolName(school.getSchoolName())
                .schoolCode(school.getSchoolCode())
                .status(school.getStatus().getStatusName())
                .schoolAddress(school.getAddress() != null ? school.getAddress() : "Chưa cập nhật")
                .schoolEmail(user.getEmail())
                .walletAddress(school.getWalletAddress() != null ? school.getWalletAddress() : "0xChuaCapNhatViBlockchain")
                .blockchainStatus("Đang hoạt động (Đã kết nối Node)")
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(dateFormatter) : "Chưa rõ")
                .approvedBy("admin@system.vn")
                .approvedAt("Chưa rõ")
                .lastLogin(user.getLastLogin() != null ? user.getLastLogin().format(dateFormatter) : "Chưa rõ")
                .build();

        // KHỐI 2: STATS (4 THẺ SỐ LIỆU TỔNG QUAN)
        long totalStudents = studentRepository.countBySchool_SchoolId(school.getSchoolId());
        long totalIssued = certificateRepository.countBySchool_SchoolIdAndStatus(school.getSchoolId(), "ISSUED");
        long totalRevoked = certificateRepository.countBySchool_SchoolIdAndStatus(school.getSchoolId(), "REVOKED");
        long totalCerts = totalIssued + totalRevoked;

        String revocationRate = "0%";
        if (totalCerts > 0) {
            double rate = ((double) totalRevoked / totalCerts) * 100;
            revocationRate = String.format("%.2f", rate) + "%";
        }

        DecimalFormat df = new DecimalFormat("#,###");
        SchoolAnalyticsDto.StatsDTO stats = SchoolAnalyticsDto.StatsDTO.builder()
                .totalStudents(df.format(totalStudents).replace(',', '.'))
                .totalIssued(df.format(totalIssued).replace(',', '.'))
                .totalRevoked(df.format(totalRevoked).replace(',', '.'))
                .revocationRate(revocationRate)
                .build();

        // KHỐI 3: ANALYTICS (DỮ LIỆU 2 BIỂU ĐỒ TAB 2)

        List<CertificateEntity> allCerts = certificateRepository.findBySchool_SchoolId(school.getSchoolId());

        // 3.1 Biểu đồ Tròn
        Map<String, Long> majorCount = allCerts.stream()
                .filter(c -> c.getStudent().getMajor() != null)
                .filter(c -> "ISSUED".equals(c.getStatus())) // Lọc bằng đã cấp như bạn đã xác nhận lúc trước
                .collect(Collectors.groupingBy(c -> c.getStudent().getMajor(), Collectors.counting()));

        List<SchoolAnalyticsDto.MajorData> majorData = majorCount.entrySet().stream()
                .map(entry -> SchoolAnalyticsDto.MajorData.builder()
                        .name(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        // 3.2 Biểu đồ Cột
        int[] monthlyCounts = new int[12];
        int currentYear = java.time.LocalDate.now().getYear();

        for (CertificateEntity cert : allCerts) {
            if (cert.getIssueDate() != null && cert.getIssueDate().getYear() == currentYear) {
                int monthIndex = cert.getIssueDate().getMonthValue() - 1;
                monthlyCounts[monthIndex]++;
            }
        }

        List<SchoolAnalyticsDto.MonthlyData> monthlyData = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            monthlyData.add(SchoolAnalyticsDto.MonthlyData.builder()
                    .name("Thg " + (i + 1))
                    .issued(monthlyCounts[i])
                    .build());
        }

        SchoolAnalyticsDto.AnalyticsDTO analytics = SchoolAnalyticsDto.AnalyticsDTO.builder()
                .majorData(majorData)
                .monthlyData(monthlyData)
                .build();

        // KHỐI 4: LOGS (NHẬT KÝ HOẠT ĐỘNG TAB 3)
        List<AuditLogEntity> logEntities = auditLogRepository.findTop20BySchool_SchoolIdOrderByCreatedAtDesc(school.getSchoolId());

        List<SchoolAnalyticsDto.LogDTO> logs = logEntities.stream()
                .map(log -> SchoolAnalyticsDto.LogDTO.builder()
                        .id(log.getId())
                        .time(log.getCreatedAt() != null ? log.getCreatedAt().format(timeFormatter) : "")
                        .action(log.getActionType())
                        .user(log.getPerformedBy())
                        .desc(log.getDescription())
                        .build())
                .collect(Collectors.toList());

        // TRẢ VỀ DUY NHẤT 1 OBJECT TỔNG HỢP (THAY CHO MAP)
        return SchoolAnalyticsDto.builder()
                .info(info)
                .stats(stats)
                .analytics(analytics)
                .logs(logs)
                .build();
    }

    public ProfileResponseDto getSchoolProfile(String username){
        SchoolEntity school = schoolRepository.findByUser_UserName(username)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        return ProfileResponseDto.builder()
                .schoolName(school.getSchoolName())
                .email(school.getUser().getEmail())
                .address(school.getAddress())
                .schoolCode(school.getSchoolCode())
                .rectorName(school.getRectorName())
                .build();
    }

    @Transactional
    public ProfileResponseDto updateProfile(String username, UpdateProfileRequest req){
        SchoolEntity school = schoolRepository.findByUser_UserName(username)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        school.setAddress(req.getAddress());
        school.setRectorName(req.getRectorName());
        auditLogService.logAction(school.getSchoolId(),"Cập nhật hồ sơ","Nhà trường đã cập nhật hồ sơ của họ",school.getSchoolCode());
        schoolRepository.save(school);
        return new ProfileResponseDto(
                school.getSchoolCode(),
                school.getSchoolName(),
                school.getUser().getEmail(),
                school.getAddress(),
                school.getRectorName()
        );
    }
}
