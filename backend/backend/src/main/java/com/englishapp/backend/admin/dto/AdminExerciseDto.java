package com.englishapp.backend.admin.dto;

import java.util.List;

// Admin view of an exercise — includes correctAnswer (hidden from regular users)
public record AdminExerciseDto(
        Long id,
        Long lessonId,
        String lessonName,
        String question,
        String type,
        List<String> options,
        String correctAnswer,
        Long vocabularyId
) {}
