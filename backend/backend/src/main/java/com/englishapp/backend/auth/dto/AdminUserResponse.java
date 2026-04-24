package com.englishapp.backend.auth.dto;

import com.englishapp.backend.auth.entity.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        String displayName,
        String avatarUrl,
        Role role,
        boolean active,
        int xp,
        int streakDays,
        LocalDate lastStudiedAt,
        LocalDateTime createdAt
) {}
