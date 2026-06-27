package com.certificate.backend.service.auth;

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

    @Async
    public void sendOtpEmail(String to, String otpCode, String subject, String actionName) {
        try {
            // Truyền các biến động vào HTML
            Context context = new Context();
            context.setVariable("otpCode", otpCode);
            context.setVariable("actionName", actionName); // Truyền mục đích gửi OTP vào đây

            String htmlBody = templateEngine.process("email-otp", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(systemEmail, "CertiChain Security");
            helper.setTo(to);
            helper.setSubject(subject); // Tiêu đề email động
            helper.setText(htmlBody, true);

            mailSender.send(message);
            System.out.println("Đã gửi email OTP (" + actionName + ") thành công tới: " + to);

        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email OTP đến " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendCertificateIssuedEmail(String to, String studentName, String studentId, String dob, String degreeNo, String major, String verifyLink) {
        try {
            Context context = new Context();
            context.setVariable("studentName", studentName);
            context.setVariable("studentId", studentId);
            context.setVariable("dob", dob);
            context.setVariable("degreeNo", degreeNo);
            context.setVariable("major", major);
            context.setVariable("verifyLink", verifyLink);

            String htmlBody = templateEngine.process("certificate-issued-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(systemEmail, "CertiChain System");
            helper.setTo(to);
            helper.setSubject("Thông báo: Văn bằng của bạn đã được cấp phát thành công");
            helper.setText(htmlBody, true);

            mailSender.send(message);
            System.out.println("Đã gửi email thông báo cấp bằng tới: " + to);

        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email thông báo cấp bằng đến " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendNotificationEmail(String to, String schoolName, String title, String statusText, String message, boolean isSuccess) {
        try {
            Context context = new Context();
            context.setVariable("schoolName", schoolName);
            context.setVariable("title", title);
            context.setVariable("statusText", statusText);
            context.setVariable("message", message);
            context.setVariable("isSuccess", isSuccess); // Quyết định màu sắc xanh/đỏ

            String htmlBody = templateEngine.process("school-status-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(systemEmail, "CertiChain Admin Management");
            helper.setTo(to);
            helper.setSubject("CertiChain - " + title); // Tiêu đề thư (Subject)
            helper.setText(htmlBody, true);

            mailSender.send(mimeMessage);
            System.out.println("Đã gửi email thông báo trạng thái tới trường: " + schoolName);

        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email thông báo trạng thái đến " + to + ": " + e.getMessage());
        }
    }
}
