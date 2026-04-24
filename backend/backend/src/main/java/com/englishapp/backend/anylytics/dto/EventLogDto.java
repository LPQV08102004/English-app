package com.englishapp.backend.anylytics.dto;

import com.englishapp.backend.anylytics.entity.EventType;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record EventLogDto(
        Long id,
        UUID userId,
        EventType eventType,
        Map<String, Object> metadata,
        LocalDateTime createdAt
) {}
