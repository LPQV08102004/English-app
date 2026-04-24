package com.englishapp.backend.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpsertLessonRequest(
        @NotNull Long courseId,
        @NotBlank String name,
        @Min(1) int orderIndex
) {}
