package com.certificate.backend.service.school.issuse;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class TranslationService {

    // Xóa dấu tiếng Việt: Nguyễn Đức Luân → Nguyen Duc Luan
    public String removeAccents(String str) {
        if (str == null) return "";
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .replace("Đ", "D")
                .replace("đ", "d");
    }

    // Dịch xếp loại tốt nghiệp
    public String translateDegree(String degree) {
        if (degree == null) return "";
        return switch (degree.trim().toLowerCase()) {
            case "xuất sắc"  -> "High Distinction";
            case "giỏi"      -> "Excellent";
            case "khá"       -> "Good";
            case "trung bình" -> "Average";
            default          -> degree;
        };
    }
    // Dịch hệ đào tạo
    public String translateTrainingType(String type) {
        if (type == null) return "";
        return switch (type.trim().toLowerCase()) {
            case "chính quy"         -> "Full-time";
            case "vừa làm vừa học"   -> "Part-time";
            case "từ xa"             -> "Distance Learning";
            default                  -> type;
        };
    }

    public String translateMajor(String major) {
        if (major == null) return "";
        return switch (major.trim().toLowerCase()) {
            case "kỹ thuật cơ điện tử"              -> "Mechatronics Engineering";
            case "kỹ thuật phần mềm"                -> "Software Engineering";
            case "khoa học máy tính"                -> "Computer Science";
            case "hệ thống thông tin"               -> "Information Systems";
            case "kỹ thuật máy tính"                -> "Computer Engineering";
            case "công nghệ thông tin"              -> "Information Technology";
            case "kỹ thuật điện tử - viễn thông"    -> "Electronics and Telecommunications Engineering";
            case "kỹ thuật điều khiển và tự động hóa" -> "Control Engineering and Automation";
            case "kỹ thuật cơ khí"                  -> "Mechanical Engineering";
            case "an toàn thông tin"                -> "Information Security";
            case "quản trị kinh doanh"              -> "Business Administration";
            default -> removeAccents(major); // Fallback: Nếu không có trong từ điển thì in ra tên tiếng Việt không dấu
        };
    }

    public String translateSchoolName(String schoolName) {
        if (schoolName == null) return "";
        return switch (schoolName.trim().toLowerCase()) {
            case "học viện công nghệ bưu chính viễn thông" -> "Posts and Telecommunications Institute of Technology";
            case "đại học bách khoa hà nội"                -> "Hanoi University of Science and Technology";
            case "đại học quốc gia hà nội"                 -> "Vietnam National University, Hanoi";
            case "đại học kinh tế quốc dân"                -> "National Economics University";
            case "đại học ngoại thương"                    -> "Foreign Trade University";
            case "đại học công nghệ thông tin"             -> "University of Information Technology";
            case "đại học khoa học tự nhiên"               -> "University of Science";
            case "đại học sư phạm kỹ thuật"                -> "University of Technical Education";
            case "đại học kiến trúc"                       -> "University of Architecture";
            case "đại học thương mại"                      -> "Thuongmai University";
            // Thêm các trường khác của bạn vào đây...
            default -> removeAccents(schoolName); // Fallback: Nếu không có trong từ điển thì in ra tên tiếng Việt không dấu
        };
    }

    public String formatDateToEnglish(LocalDate date) {
        if (date == null) return "";
        return date.format(DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.ENGLISH));
    }
}
