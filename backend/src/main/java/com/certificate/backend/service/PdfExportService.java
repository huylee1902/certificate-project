package com.certificate.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.pdf.BaseFont;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import com.certificate.backend.model.entity.StudentEntity;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class PdfExportService {

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private TranslationService translationService;

    @Value("${app.base-url}")
    private String baseUrl;

    // Truyền thêm degreeNo và regNo từ hàm Cấp Bằng vào đây
    public byte[] generatePdfBytes(StudentEntity student, String certId, String regNo) throws Exception {
        Context context = new Context();

        // ── 1. THÔNG TIN CHUNG VÀ MÃ XÁC THỰC ────────────────────────
        context.setVariable("universityEn", translationService.translateSchoolName(student.getSchool().getSchoolName().toUpperCase()) );
        context.setVariable("rectorName", student.getSchool().getRectorName());
        context.setVariable("date", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("degreeNo", certId);
        context.setVariable("regNo", regNo);

        // Tạo QR Code dẫn tới link Ngrok
        String verifyUrl = baseUrl + "/?certId=" + certId;
        context.setVariable("qrBase64", generateQRCodeBase64(verifyUrl));


        // ── 2. CỘT PHẢI (TIẾNG VIỆT) ──────────────────────────────────
        context.setVariable("universityVi",student.getSchool().getSchoolName().toUpperCase());
        context.setVariable("majorVi", student.getMajor().toUpperCase());
        context.setVariable("fullNameVi", student.getFullName().toUpperCase());
        context.setVariable("dobVi", student.getDob().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("gradYear", String.valueOf(LocalDate.now().getYear()));
        context.setVariable("classificationVi", student.getDegreeType()); // Giả sử entity có trường này
        context.setVariable("modeOfStudyVi", student.getTrainingType());


        // ── 3. CỘT TRÁI (TIẾNG ANH - Qua TranslationService) ──────────
        context.setVariable("universityEn",translationService.translateSchoolName(student.getSchool().getSchoolName().toUpperCase()));
        context.setVariable("majorEn", translationService.translateMajor(student.getMajor().toUpperCase()));
        context.setVariable("fullNameEn", translationService.removeAccents(student.getFullName()).toUpperCase());
        context.setVariable("dobEn", translationService.formatDateToEnglish(student.getDob()));
        context.setVariable("gradYear", String.valueOf(LocalDate.now().getYear()));
        context.setVariable("classificationEn", translationService.translateDegree(student.getDegreeType()));
        context.setVariable("modeOfStudyEn", translationService.translateTrainingType(student.getTrainingType()));


        // ── 4. RENDER HTML → PDF BẰNG FLYING SAUCER ────────────────────
        String htmlContent = templateEngine.process("certificate", context);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Nạp đủ bộ font Times New Roman để không bị lỗi Font tiếng Việt
            addFont(renderer, "fonts/times.ttf");
            addFont(renderer, "fonts/timesbd.ttf");
            addFont(renderer, "fonts/timesi.ttf");
            addFont(renderer, "fonts/timesbi.ttf");

            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(out);

            return out.toByteArray();
        }
    }

    private void addFont(ITextRenderer renderer, String resourcePath) throws Exception {
        String fontUrl = new ClassPathResource(resourcePath).getURL().toString();
        renderer.getFontResolver().addFont(fontUrl, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
    }

    // Hàm phụ trợ tạo QR Code thành chuỗi Base64
    private String generateQRCodeBase64(String text) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        // Kích thước 150x150 là vừa đẹp cho góc văn bằng
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 150, 150);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return Base64.getEncoder().encodeToString(pngOutputStream.toByteArray());
    }
}