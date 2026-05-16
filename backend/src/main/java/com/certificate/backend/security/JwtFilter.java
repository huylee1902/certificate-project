package com.certificate.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Service
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;



    private String parseJwtToken(HttpServletRequest request){
        // Tách token từ header request
        final String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // Hoặc từ cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            final String token = parseJwtToken(request);

            // 1. Không có token -> Cho đi tiếp (Sẽ bị Spring Security chặn sau nếu API đó yêu cầu quyền)
            if (token == null || !StringUtils.hasText(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Token đã bị Blacklist (Đăng xuất)
            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("Token này đã bị đăng xuất/thu hồi!");
                return;
            }

            // 3. Giải mã và kiểm tra Token
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                // Nếu validateToken ném lỗi, nó sẽ nhảy thẳng xuống block catch bên dưới
                if (jwtTokenService.validateToken(token)) {
                    String username = jwtTokenService.getUsernameFromToken(token);

                    // 4. Kiểm tra tài khoản bị khóa
                    if (username != null && tokenBlacklistService.isUserSuspended(username)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                        response.setCharacterEncoding("UTF-8");
                        response.getWriter().write("Tài khoản của bạn đã bị Admin khóa!");
                        return;
                    }

                    // 5. Cấp quyền thành công
                    if (username != null) {
                        Long schoolId = jwtTokenService.getSchoolIdFromToken(token);
                        List<GrantedAuthority> authorities = jwtTokenService.getRolesFromToken(token);
                        JwtPrincipal principal = new JwtPrincipal(username, schoolId);
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(principal, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (ExpiredJwtException | SignatureException | MalformedJwtException e) {
            // BẮT LỖI TỪ THƯ VIỆN JWT: Đừng return 401 ở đây!
            // Cứ xóa Context (để đảm bảo an toàn) rồi cho request đi qua.
            // Nếu họ đang gọi API Login -> Vẫn login bình thường.
            // Nếu họ gọi API cần quyền -> Spring Security (AuthenticationEntryPoint) sẽ tự văng lỗi 401 thay cho bạn.
            SecurityContextHolder.clearContext();

            // System.out.println("Cảnh báo: Token hết hạn hoặc không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        // Cho phép request tiếp tục đi vào Controller hoặc các Filter khác
        filterChain.doFilter(request, response);
    }
}
