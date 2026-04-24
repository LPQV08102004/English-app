package com.englishapp.backend.admin.dto;

import com.englishapp.backend.content.entity.ExerciseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpsertExerciseRequest(
        @NotNull Long lessonId,
        @NotBlank String question,
        @NotNull ExerciseType type,
        // Required for MULTIPLE_CHOICE (min 2 options); null/empty for FILL_IN_THE_BLANK
        List<String> options,
        @NotBlank String correctAnswer,
        // Optional: link exercise to a vocabulary entry for mistake tracking
        Long vocabularyId
) {}
