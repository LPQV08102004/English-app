package com.englishapp.backend.anylytics.controller;

import com.englishapp.backend.anylytics.dto.LogEventRequest;
import com.englishapp.backend.anylytics.service.EventLogService;
import com.englishapp.backend.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Client-side event logging")
@SecurityRequirement(name = "bearerAuth")
public class EventLogController {

    private final EventLogService eventLogService;

    @PostMapping("/log")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(
            summary = "Log a client-side event",
            description = """
                    Use this to log additional client-side events not covered by server-side AOP.
                    The response is 202 Accepted — the event is persisted asynchronously.
                    Supported types: START_LESSON, FINISH_LESSON, ANSWER_CORRECT, ANSWER_WRONG.
                    """)
    public ApiResponse<String> logEvent(
            @Valid @RequestBody LogEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        eventLogService.log(userDetails.getUsername(), request.eventType(), request.metadata());
        return ApiResponse.of("Event accepted");
    }
}
