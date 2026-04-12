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
                                "/api/certificates/verify/**"
                        ).permitAll()
                        .requestMatchers("/api/schools/**").hasRole("ADMIN")

                        // Tất cả endpoint còn lại BẮT BUỘC phải có token hợp lệ
                        .anyRequest().authenticated()
                )

                // Thêm JwtFilter vào chuỗi filter
                // Chạy TRƯỚC UsernamePasswordAuthenticationFilter (filter: bộ lọc mặc định)
                // Vì cần xác thực JWT trước khi Spring Security kiểm tra
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
