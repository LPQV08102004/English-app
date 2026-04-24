package com.englishapp.backend.content.dto;

import java.util.List;

public record LessonDetailDto(
        Long id,
        String name,
        Long courseId,
        String courseName,
        int orderIndex,
        List<ExerciseDto> exercises
) {}
