package com.englishapp.backend.auth.dto;

import com.englishapp.backend.auth.entity.Role;

public record AdminUpdateUserRequest(
        String displayName,
        String avatarUrl,
        Role role,
        Boolean active,
        Integer xp
) {}
