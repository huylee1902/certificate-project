package com.certificate.backend.controller;

import com.certificate.backend.model.dto.Request.ChatRequest;
import com.certificate.backend.model.dto.Response.ApiResponse;
import com.certificate.backend.model.dto.Response.ChatResponse;
import com.certificate.backend.service.chatbot.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<ChatResponse> handleChat(@RequestBody ChatRequest request) {
        String aiReply = chatbotService.getAiReply(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(aiReply));
    }
}