package com.certificate.backend.service;

import com.lowagie.text.pdf.BaseFont;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import com.certificate.backend.model.entity.StudentEntity;

import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfExportService {

    @Autowired
    private TemplateEngine templateEngine;

    @Autowired
    private UploadService uploadService;

    @Autowired
    private TranslationService translationService;

    public byte[] generatePdfBytes(StudentEntity student, Long schoolId) throws Exception {
        Context context = new Context();

        // ── TIẾNG VIỆT ──────────────────────────────────────────────
        context.setVariable("majorVi", student.getMajor().toUpperCase());
        context.setVariable("studentName",  student.getFullName().toUpperCase());
        context.setVariable("dob",          student.getDob().format(
                DateTimeFormatter.ofPattern("dd.MM.yyyy")));

        context.setVariable("gradYear", LocalDate.now().getYear());

        context.setVariable("degreeType",   student.getDegreeType());
        context.setVariable("trainingType", student.getTrainingType());


        // ── TIẾNG ANH (qua StudentTranslationService) ───────────────
        context.setVariable("majorEn", translationService.translateMajor(student.getMajor().toUpperCase()));
        context.setVariable("studentNameEn",
                translationService.removeAccents(student.getFullName()).toUpperCase());

        context.setVariable("dobEn", translationService.formatDateToEnglish(student.getDob()));

        context.setVariable("degreeTypeEn",
                translationService.translateDegree(student.getDegreeType()));

        context.setVariable("trainingTypeEn",
                translationService.translateTrainingType(student.getTrainingType()));



        // ── ẢNH PHÔI BẰNG ───────────────────────────────────────────
        context.setVariable("backgroundImageUrl",
                uploadService.getBackgroundUri(schoolId));

        // ── RENDER HTML → PDF ────────────────────────────────────────
        String htmlContent = templateEngine.process("certificate", context);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Nạp đủ bộ font Times New Roman (bắt buộc cho tiếng Việt)
            addFont(renderer, "fonts/times.ttf");
            addFont(renderer, "fonts/timesbd.ttf");
            addFont(renderer, "fonts/timesi.ttf");
            addFont(renderer, "fonts/timesbi.ttf");

            // Base URL để Flying Saucer resolve ảnh phôi bằng
            //String baseUrl = new ClassPathResource("").getURL().toString();
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

}
