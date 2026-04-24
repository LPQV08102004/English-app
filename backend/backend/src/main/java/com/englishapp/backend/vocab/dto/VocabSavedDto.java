package com.englishapp.backend.vocab.dto;

import java.time.LocalDateTime;

public record VocabSavedDto(
        Long id,
        String word,
        String meaning,
        String note,
        String source,
        LocalDateTime createdAt
) {}
