package com.englishapp.backend.anylytics.dto;

import com.englishapp.backend.anylytics.entity.EventType;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record LogEventRequest(
        @NotNull EventType eventType,
        Map<String, Object> metadata
) {}
