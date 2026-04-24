package com.englishapp.backend.content.dto;

import java.util.List;

// correctAnswer is intentionally omitted — grading is server-side only
public record ExerciseDto(
        Long id,
        String question,
        String type,
        List<String> options
) {}
