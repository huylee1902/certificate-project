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
                                "/api/chat/**"
                        ).permitAll()
                        .requestMatchers(
                                "/api/schools/*/approve",
                                "/api/schools/*/reject",
                                "/api/schools/*/suspend",
                                "/api/schools/*/reinstate"
                        ).hasAuthority("ADMIN")


                        .requestMatchers(
                                "/api/schools/certificates/issue",
                                "/api/schools/certificates/revoke/*"
                        )
                        .hasAuthority("SCHOOL")

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
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Port của React
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
