package com.certificate.backend.security;

import com.certificate.backend.model.enums.SchoolStatus;
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
    private SecurityUserDetailsService userDetailsService;

    private String parseJwtToken(HttpServletRequest request){

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


            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                // Nếu validateToken ném lỗi, nó sẽ nhảy thẳng xuống block catch bên dưới
                if (jwtTokenService.validateToken(token)) {
                    String username = jwtTokenService.getUsernameFromToken(token);

                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        SecurityUserDetail myUser = (SecurityUserDetail) userDetails;
                        if(myUser.getSchool()!= null){
                            if (myUser.getUser().getSchool().getStatus() == SchoolStatus.SUSPENDED) {
                                SecurityContextHolder.clearContext();
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403 Đá văng
                                response.setContentType("application/json;charset=UTF-8");
                                response.getWriter().write("{\"code\": 403, \"message\": \"Tài khoản của bạn đã bị Admin khóa!\"}");
                                return;
                            }
                        }

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(myUser, null, myUser.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\": 401, \"message\": \"Access Token đã hết hạn\"}");
            return; // QUAN TRỌNG: Phải return để ngắt luồng, không cho đi tiếp xuống FilterChain

        }

    }
}
