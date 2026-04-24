package com.englishapp.backend.content.dto;

public record SubmitAnswerResponse(
        boolean correct,
        int xpEarned,
        // Wrong attempts for this specific exercise in the current session
        int wrongAttempts,
        // True when wrong attempts >= 5 — lesson progress is reset and must be restarted
        boolean lessonFailed,
        // True when all exercises in the lesson have been answered correctly
        boolean lessonCompleted,
        // Bonus XP awarded on lesson completion
        int bonusXp
) {}
