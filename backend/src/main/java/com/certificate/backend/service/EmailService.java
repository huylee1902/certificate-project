package com.certificate.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    // Gọi công cụ xử lý giao diện HTML của Thymeleaf
    @Autowired
    private SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String systemEmail;

    @Async // Đảm bảo việc gửi mail chạy trên một luồng phụ (không làm nghẽn API chính)
    public void sendActivationEmail(String to, String subject, String schoolName, String activationLink) {
        try {
            // 1. Tạo biến để truyền vào file HTML
            Context context = new Context();
            context.setVariable("schoolName", schoolName);
            context.setVariable("activationLink", activationLink);

            // 2. Dùng Thymeleaf để render file "email-activation.html" thành mã HTML hoàn chỉnh
            String htmlBody = templateEngine.process("email-activation", context);

            // 3. Khởi tạo đối tượng Thư
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // --- CẤU HÌNH TÊN NGƯỜI GỬI (SENDER NAME) ---
            // Cú pháp: setFrom(địa_chỉ_email, Tên_hiển_thị_bằng_tiếng_Việt)
            helper.setFrom(systemEmail, "CertiChain");

            // 4. Cấu hình người nhận và nội dung
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = Báo cho Gmail biết đây là thư chứa code HTML

            // 5. Ra lệnh gửi
            mailSender.send(message);
            System.out.println("Đã gửi email kích hoạt thành công tới: " + to);

        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Lỗi khi gửi email đến " + to + ": " + e.getMessage());
        }
    }
}
