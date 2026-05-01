package com.englishapp.backend.auth.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID id,
        String email,
        String displayName,
        String avatarUrl,
        int xp,
        int streakDays,
        String role
) {}
