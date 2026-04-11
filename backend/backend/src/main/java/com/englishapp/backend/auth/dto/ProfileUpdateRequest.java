package com.englishapp.backend.auth.dto;

public record ProfileUpdateRequest(
        String displayName,
        String avatarUrl
) {}
