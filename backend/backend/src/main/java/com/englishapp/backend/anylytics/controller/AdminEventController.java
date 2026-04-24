package com.englishapp.backend.anylytics.controller;

import com.englishapp.backend.anylytics.dto.EventLogDto;
import com.englishapp.backend.anylytics.dto.EventStatsDto;
import com.englishapp.backend.anylytics.entity.EventType;
import com.englishapp.backend.anylytics.service.EventLogService;
import com.englishapp.backend.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@Tag(name = "Admin - Events", description = "Event log viewer and statistics (ROLE_ADMIN only)")
public class AdminEventController {

    private final EventLogService eventLogService;

    @GetMapping
    @Operation(summary = "List event logs — filter by userId and/or eventType")
    public ApiResponse<Page<EventLogDto>> list(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) EventType eventType,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        return ApiResponse.of(eventLogService.listEvents(userId, eventType, pageable));
    }

    @GetMapping("/stats")
    @Operation(summary = "Event summary statistics: total count, breakdown by type, top active users")
    public ApiResponse<EventStatsDto> stats() {
        return ApiResponse.of(eventLogService.getStats());
    }
}
