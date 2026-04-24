package com.englishapp.backend.vocab.dto;

import java.time.LocalDateTime;

public record MistakeReviewDto(
        Long vocabularyId,
        String word,
        String meaning,
        String ipa,
        String topic,
        String level,
        int mistakeCount,
        LocalDateTime lastReviewedAt
) {}
