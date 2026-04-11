package com.englishapp.backend.auth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProfileResponse(
        UUID userId,
        String email,
        String displayName,
        String avatarUrl,
        int xp,
        int streakDays,
        LocalDateTime createdAt
) {}
