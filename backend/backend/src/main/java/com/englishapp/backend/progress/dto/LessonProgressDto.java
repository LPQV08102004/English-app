package com.englishapp.backend.progress.dto;

public record LessonProgressDto(
        Long lessonId,
        String status,
        int score
) {}
