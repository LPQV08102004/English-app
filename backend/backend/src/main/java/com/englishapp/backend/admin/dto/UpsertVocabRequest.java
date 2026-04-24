package com.englishapp.backend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

public record UpsertVocabRequest(
        Long lessonId,
        @NotBlank String word,
        @NotBlank String meaning,
        String ipa,
        String partOfSpeech,
        String audioUrl,
        String example,
        @Pattern(regexp = "A1|A2|B1|B2|C1|C2", message = "difficultyLevel must be A1, A2, B1, B2, C1, or C2")
        String difficultyLevel,
        String topic,
        Map<String, String> grammarInfo
) {}
