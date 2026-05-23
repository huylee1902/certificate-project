package com.certificate.backend.service;

import com.certificate.backend.exception.AppException;
import com.certificate.backend.model.entity.CertificateEntity;
import com.certificate.backend.model.dto.Response.SchoolDashboardDto;
import com.certificate.backend.model.entity.SchoolEntity;
import com.certificate.backend.model.enums.ErrorCode;
import com.certificate.backend.repository.CertificateRepository;
import com.certificate.backend.repository.SchoolRepository;
import com.certificate.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolDashboardService {

    private final StudentRepository studentRepository;
    private final CertificateRepository certificateRepository;
    private final SchoolRepository schoolRepository;

    public SchoolDashboardDto getDashboardData(String username) {
        SchoolEntity school = schoolRepository.findByUser_UserName(username)
                .orElseThrow(() -> new AppException(ErrorCode.SCHOOL_NOT_FOUND));

        Long schoolId = school.getSchoolId();
        // 1. LẤY THỐNG KÊ 4 THẺ TRÊN CÙNG
        long totalStudents = studentRepository.countBySchool_SchoolId(schoolId);
        long pendingStudents = studentRepository.countBySchool_SchoolIdAndStatus(schoolId, 0); // Hoặc logic đếm khác của bạn
        long issuedCerts = certificateRepository.countBySchool_SchoolIdAndStatus(schoolId, "ISSUED");
        long revokedCerts = certificateRepository.countBySchool_SchoolIdAndStatus(schoolId, "REVOKED");

        // 2. LẤY DỮ LIỆU BIỂU ĐỒ TRÒN (CHUYÊN NGÀNH)
        // CODE MỚI (Chỉ đếm các bằng đã cấp)
        List<Object[]> majorData = certificateRepository.countIssuedCertificatesByMajor(schoolId);
        List<SchoolDashboardDto.MajorChart> majorChart = majorData.stream()
                .map(obj -> SchoolDashboardDto.MajorChart.builder()
                        .name((String) obj[0])
                        .value((Long) obj[1])
                        .build())
                .collect(Collectors.toList());

        // 3. LẤY DỮ LIỆU BIỂU ĐỒ CỘT (THEO 5 THÁNG GẦN NHẤT CỦA NĂM NAY)
        List<SchoolDashboardDto.MonthlyChart> monthlyChart = generateMonthlyChart(schoolId);

        // 4. LẤY LỊCH SỬ GIAO DỊCH VÀ XỬ LÝ "10 PHÚT TRƯỚC"
        List<SchoolDashboardDto.RecentActivity> recentActivities = getRecentActivities(schoolId);

        // 5. TRẢ VỀ JSON HOÀN CHỈNH
        return SchoolDashboardDto.builder()
                .totalStudents(totalStudents)
                .issuedCertificates(issuedCerts)
                .revokedCertificates(revokedCerts)
                .pendingStudents(pendingStudents)
                .majorChart(majorChart)
                .monthlyChart(monthlyChart)
                .recentActivities(recentActivities)
                .build();
    }

    // ============ CÁC HÀM XỬ LÝ PHỤ TRỢ (HELPER METHODS) ============

    // Hàm xử lý Bảng giao dịch gần đây
    private List<SchoolDashboardDto.RecentActivity> getRecentActivities(Long schoolId) {
        // Gọi hàm mới: lấy theo updatedAt giảm dần
        List<CertificateEntity> recentCerts = certificateRepository.findTop5BySchool_SchoolIdOrderByUpdatedAtDesc(schoolId);

        return recentCerts.stream().map(cert ->
                SchoolDashboardDto.RecentActivity.builder()
                        .id("TX-" + cert.getCertId())
                        // CHỈ CẦN LẤY updatedAt ĐỂ TÍNH THỜI GIAN, CỰC KỲ NHÀN!
                        .time(calculateRelativeTime(cert.getUpdatedAt()))
                        .action("ISSUED".equals(cert.getStatus()) ? "Cấp phát văn bằng" : "Thu hồi văn bằng")
                        .student(cert.getStudent().getFullName())
                        .status("ISSUED".equals(cert.getStatus()) ? "SUCCESS" : "REVOKED")
                        .hash(cert.getTxHash() != null ? cert.getTxHash() : "Chưa có Hash")
                        .build()
        ).collect(Collectors.toList());
    }

    // Hàm thuật toán đổi DateTime ra "10 phút trước", "2 giờ trước"...
    private String calculateRelativeTime(LocalDateTime pastTime) {
        if (pastTime == null) return "Vừa xong";

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(pastTime, now);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return minutes + " phút trước";

        long hours = ChronoUnit.HOURS.between(pastTime, now);
        if (hours < 24) return hours + " giờ trước";

        long days = ChronoUnit.DAYS.between(pastTime, now);
        if (days <= 30) return days + " ngày trước";

        // Nếu quá 30 ngày thì trả về tháng
        long months = ChronoUnit.MONTHS.between(pastTime, now);
        return months + " tháng trước";
    }

    // Hàm xử lý biểu đồ Cột (Chia theo tháng)
    private List<SchoolDashboardDto.MonthlyChart> generateMonthlyChart(Long schoolId) {
        List<CertificateEntity> allCerts = certificateRepository.findAllBySchoolThisYear(schoolId);
        List<SchoolDashboardDto.MonthlyChart> chart = new ArrayList<>();

        // Lặp từ tháng 1 đến tháng hiện tại (Hoặc lấy đúng 5 tháng lùi lại)
        int currentMonth = LocalDateTime.now().getMonthValue();
        int startMonth = Math.max(1, currentMonth - 4); // Lấy 5 tháng gần nhất

        for (int i = startMonth; i <= currentMonth; i++) {
            final int month = i;
            // Đếm số bằng ISSUED trong tháng
            long issued = allCerts.stream()
                    .filter(c -> c.getIssueDate() != null && c.getIssueDate().getMonthValue() == month && "ISSUED".equals(c.getStatus()))
                    .count();

            // Đếm số bằng REVOKED trong tháng
            long revoked = allCerts.stream()
                    .filter(c -> c.getRevokedAt() != null && c.getRevokedAt().getMonthValue() == month && "REVOKED".equals(c.getStatus()))
                    .count();

            chart.add(SchoolDashboardDto.MonthlyChart.builder()
                    .name("Th." + month)
                    .issued(issued)
                    .revoked(revoked)
                    .build());
        }
        return chart;
    }
}