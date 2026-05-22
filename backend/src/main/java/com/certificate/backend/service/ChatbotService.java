package com.certificate.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAiReply(String userMessage) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Vui lòng cấu hình Gemini API Key trong file application.properties của Back-end!";
        }

        try {
            // ĐỒNG BỘ THẾ HỆ MỚI: Sử dụng cổng v1 và định danh chính xác model gemini-3.5-flash
            String urlString = "https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=" + apiKey;
            
            // Khởi tạo URI để ngăn RestTemplate tự ý mã hóa ký tự ':' thành '%3A'
            URI uri = new URI(urlString);

            // Thiết lập bối cảnh hệ thống văn bằng CertiChain
            String projectContext = "Bạn là trợ lý AI độc quyền của hệ thống CertiChain (Hệ thống xác thực văn bằng bằng Blockchain và IPFS). "
            + "Hãy dựa vào các thông tin sau để trả lời người dùng ngắn gọn bằng tiếng Việt:\n"
            + "1. Công nghệ: FE ReactJS, BE Java Spring Boot, DB MySQL, mạng lưới IPFS lưu file văn bằng, Smart Contract Solidity chống làm giả.\n"
            + "2. Chức năng: Tra cứu văn bằng; Xác thực file PDF qua mã Hash; Đăng ký tài khoản trường đại học; AI Chatbot giải đáp thắc mắc.\n"
            + "QUY TẮC ĐỊNH DẠNG BẮT BUỘC:\n"
            + "- Tuyệt đối KHÔNG viết câu trả lời thành một khối văn bản dài dày đặc.\n"
            + "- Phải chủ động sử dụng dấu xuống dòng để phân tách các ý lớn.\n"
            + "- Sử dụng các ký tự đầu dòng như (1., 2., hoặc dấu -) để làm danh sách liệt kê rõ ràng, dễ nhìn.\n"
            + "Câu hỏi của người dùng: " + userMessage;

            // Đóng gói cấu trúc JSON chuẩn theo quy định của Google API v1
            Map<String, Object> textMap = new HashMap<>();
            textMap.put("text", projectContext);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", List.of(textMap));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(partsMap));

            // Thiết lập Header application/json tường minh
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Thực hiện truyền tải dữ liệu yêu cầu lên máy chủ AI
            Map<String, Object> response = restTemplate.postForObject(uri, entity, Map.class);

            // Bóc tách dữ liệu JSON an toàn từ cấu trúc trả về của bản v1
            if (response != null && response.containsKey("candidates")) {
                List<?> candidates = (List<?>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                            return (String) firstPart.get("text");
                        }
                    }
                }
            }
            return "Không thể phân tích phản hồi từ AI.";
        } catch (Exception e) {
            return "Lỗi kết nối với AI Server: " + e.getMessage();
        }
    }
}
