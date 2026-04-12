package com.certificate.backend.controller;


import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {
    @Autowired
    private AdminService adminService;

    @PutMapping("/{id}/approve") // Cập nhập trạng thái thì dùng put
    public ApiResponse<?> approve(
            @PathVariable Long id
    ) {
        adminService.approveSchool(id);
        return ApiResponse.success("Duyệt thành công!");
    }

    // Từ chối trường
    @PutMapping("/{id}/reject")
    public ApiResponse<?> reject(
            @PathVariable Long id
    ) {
        adminService.rejectSchool(id);
        return ApiResponse.success("Hệ thống nhâ thấy thông tin bạn cung cấp là giả mạo vậy nên" +
                "tài khoản cuủa ba đã bị TỪ CHỐI. Xin thông cảm");
    }

    // Khóa trường
    @PutMapping("/{id}/suspend")
    public ApiResponse<?> suspend(
            @PathVariable Long id
    ) {
        adminService.suspendSchool(id);
        return ApiResponse.success("Tài khoản bị khóa!");
    }

    // Mở khóa trường
    @PutMapping("/{id}/reinstate")
    public ApiResponse<?> reinstate(@PathVariable Long id) {
        adminService.reinstateSchool(id);
        return ApiResponse.success("Đã mở khóa trường!");
    }
}
