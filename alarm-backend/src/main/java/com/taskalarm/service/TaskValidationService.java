package com.taskalarm.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskalarm.dto.ValidationResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class TaskValidationService {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    public TaskValidationService(WebClient geminiWebClient) {
        this.geminiWebClient = geminiWebClient;
    }

    private static final int MIN_WORDS = 30;
    private static final int MAX_WORDS = 50;

    public ValidationResult validateTask(String text) {
        int wordCount = countWords(text);

        // Cheap check first — avoids an API call for obviously wrong-length input
        if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
            return new ValidationResult(false,
                    "Task must be " + MIN_WORDS + "-" + MAX_WORDS + " words. Yours: " + wordCount);
        }

        return callGeminiForValidation(text);
    }

    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) return 0;
        return text.trim().split("\\s+").length;
    }

    private ValidationResult callGeminiForValidation(String text) {
        String prompt = buildPrompt(text);

        // Gemini's generateContent request shape — different from Claude's /v1/messages shape
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        try {
            String rawResponse = geminiWebClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseGeminiResponse(rawResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return new ValidationResult(false, "Could not reach AI validation service, please try again.");
        }
    }

    private String buildPrompt(String text) {
        return """
                A user is writing their task for today as part of an alarm-clock app.
                The alarm will not stop ringing until their task passes validation.

                Task text: "%s"

                Determine if this describes a real, coherent, meaningful task or goal
                for the day — not random words, keyboard mashing, gibberish, or
                copy-pasted filler text.

                Respond with ONLY valid JSON, nothing else, no markdown fences:
                { "valid": true or false, "reason": "short one-sentence explanation" }
                """.formatted(text.replace("\"", "\\\""));
    }

    private ValidationResult parseGeminiResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            // Gemini's response path: candidates[0].content.parts[0].text
            String aiText = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            String cleaned = aiText.replaceAll("```json|```", "").trim();
            return objectMapper.readValue(cleaned, ValidationResult.class);
        } catch (Exception e) {
            return new ValidationResult(false, "Could not parse AI response, please retry.");
        }
    }
}