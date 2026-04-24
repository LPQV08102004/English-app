package com.englishapp.backend.content.dto;

import java.util.List;

public record CourseResponse(
        Long id,
        String name,
        String description,
        String levelTarget,
        int lessonCount,
        List<LessonSummaryDto> lessons
) {}
