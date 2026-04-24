package com.englishapp.backend.anylytics.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record EventStatsDto(
        long totalEvents,
        // e.g. {"START_LESSON": 200, "FINISH_LESSON": 150, ...}
        Map<String, Long> countByType,
        // Top 10 most active user IDs with their event counts
        List<UserActivityDto> topUsers
) {
    public record UserActivityDto(UUID userId, long totalEvents) {}
}
