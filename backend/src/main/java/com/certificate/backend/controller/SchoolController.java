package com.certificate.backend.controller;

import com.certificate.backend.model.dto.Request.UpdateProfileRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.ProfileResponseDto;
import com.certificate.backend.model.dto.Response.SchoolDashboardDto;
import com.certificate.backend.service.SchoolDashboardService;
import com.certificate.backend.service.SchoolService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/school")
public class SchoolController {
    @Autowired
    private SchoolDashboardService dashboardService;
    @Autowired
    private SchoolService schoolService;

    @GetMapping("/dashboard")
    public ApiResponse<?> getDashboard(Principal principal) {
        String username = principal.getName();

        SchoolDashboardDto data = dashboardService.getDashboardData(username);

        return ApiResponse.success(data);
    }

    @GetMapping("/profile")
    public ApiResponse<?> getSchoolProfile(Principal principal){
        String username = principal.getName();
        ProfileResponseDto data = schoolService.getSchoolProfile(username);
        return ApiResponse.success(data);
    }

    @PutMapping("/profile")
    public ApiResponse<?> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest req){
        String username = principal.getName();
        ProfileResponseDto dto = schoolService.updateProfile(username, req);

        return ApiResponse.success(dto, "Cập nhật thành công!");
    }
}
