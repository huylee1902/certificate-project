package com.certificate.backend.controller;


import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.PageAdminDto;
import com.certificate.backend.model.dto.Response.SchoolAnalyticsDto;
import com.certificate.backend.model.dto.Response.SchoolDto;
import com.certificate.backend.service.auth.AccountService;
import com.certificate.backend.service.admin.AdminService;
import com.certificate.backend.service.admin.AuditLogService;
import com.certificate.backend.service.admin.SchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")

public class AdminController {
    @Autowired
    private AdminService adminService;
    @Autowired
    private SchoolService schoolService;
    @Autowired
    private AuditLogService auditLogService;
    @Autowired
    private AccountService accountService;

    @PutMapping("/{schoolId}/approve") // Cập nhập trạng thái thì dùng put
    public ApiResponse<?> approve(
            @PathVariable Long schoolId
    ) {
        adminService.approveSchool(schoolId);
        return ApiResponse.success("Duyệt thành công!");
    }

    // Từ chối trường
    @PutMapping("/{schoolId}/reject")
    public ApiResponse<?> reject(
            @PathVariable Long schoolId
    ) {
        adminService.rejectSchool(schoolId);
        return ApiResponse.success("Hệ thống nhâ thấy thông tin bạn cung cấp là giả mạo vậy nên" +
                "tài khoản cuủa ba đã bị TỪ CHỐI. Xin thông cảm");
    }

    // Khóa trường
    @PutMapping("/{schoolId}/suspend")
    public ApiResponse<?> suspend(
            @PathVariable Long schoolId
    ) {
        adminService.suspendSchool(schoolId);
        return ApiResponse.success("Tài khoản bị khóa!");
    }

    // Mở khóa trường
    @PutMapping("/{schoolId}/reinstate")
    public ApiResponse<?> reinstate(@PathVariable Long schoolId) {
        adminService.reinstateSchool(schoolId);
        return ApiResponse.success("Đã mở khóa trường!");
    }

    @GetMapping("/dashboard-stats")
    public ApiResponse<?> getDashboardStats() {
        return ApiResponse.success(schoolService.getDashboardStats());
    }

    //BẢNG QUẢN LÝ TRƯỜNG
    @GetMapping("/schools")

    public ApiResponse<PageAdminDto<SchoolDto>> getSchools(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageAdminDto<SchoolDto> result = schoolService.getSchools(keyword, status, page, size);

        return ApiResponse.success(result);
    }

    @GetMapping("/schools/{schoolId}/analytics")
    public ApiResponse<?> getSchoolAnalytics(@PathVariable("schoolId") Long schoolId) {
        // Hứng userId từ Frontend, đưa cho Service xử lý
        SchoolAnalyticsDto data = schoolService.getSchoolAnalytics(schoolId);

        // Trả cục JSON về cho Frontend
        return ApiResponse.success(data);
    }

    @GetMapping("/profile")
    public ApiResponse<?> getProfile(){
        Map<String, Object> data = accountService.getProfile();
        return ApiResponse.success(data);
    }
}
