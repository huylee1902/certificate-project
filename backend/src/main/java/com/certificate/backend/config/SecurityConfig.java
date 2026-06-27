package com.certificate.backend.config;

import com.certificate.backend.security.JwtFilter;
import com.certificate.backend.security.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF vì dùng JWT (stateless, không dùng cookie)
                // CSRF chỉ cần khi dùng session + cookie
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                // Tắt session - mỗi request phải tự mang token
                // STATELESS: server không lưu trạng thái của client
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        // Các endpoint này KHÔNG cần token
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh",
                                "/api/certificates/verify/**",
                                "/api/certificates/search",
                                "/api/auth/forgot-password",
                                "/api/auth/forgot-password/verify",
                                "/api/auth/forgot-password/reset",
                                "/api/auth/verify-otp",
                                "/api/certificates/scan",
                                "/api/auth/activate",
                                "/api/auth/resend-activation",
                                "/api/chat/**"
                        ).permitAll()
                        .requestMatchers(
                                "/api/admin/*/approve",
                                "/api/admin/*/reject",
                                "/api/admin/*/suspend",
                                "/api/admin/*/reinstate",
                                "/api/admin/dashboard-stats",
                                "/api/admin/schools",
                                "/api/admin/schools/*/analytics",
                                "/api/admin/profile"
                        ).hasRole("ADMIN")


                        .requestMatchers(
                                "/api/students/import",
                                "/api/students",
                                "/api/students/*",
                                "/api/certificates/issue",
                                "/api/certificates/revoke/*",
                                "/api/school/dashboard"
                        )
                        .hasRole("SCHOOL")

                        // Tất cả endpoint còn lại BẮT BUỘC phải có token hợp lệ
                        .anyRequest().authenticated()
                )

                // Thêm JwtFilter vào chuỗi filter
                // Chạy TRƯỚC UsernamePasswordAuthenticationFilter (filter: bộ lọc mặc định)
                // Vì cần xác thực JWT trước khi Spring Security kiểm tra
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173",
                "http://192.168.1.8:5173",                           // ← Thêm IP LAN
                "https://ladder-sharpie-drab.ngrok-free.dev"         // ← Thêm ngrok frontend
                 ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
