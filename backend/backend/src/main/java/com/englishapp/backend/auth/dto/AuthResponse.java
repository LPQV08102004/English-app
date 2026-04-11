package com.englishapp.backend.auth.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String email,
        String displayName,
        String avatarUrl,
        int xp,
        int streakDays
) {}
