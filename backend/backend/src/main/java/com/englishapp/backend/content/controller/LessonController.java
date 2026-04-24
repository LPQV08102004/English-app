package com.englishapp.backend.content.controller;

import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.content.dto.LessonDetailDto;
import com.englishapp.backend.content.dto.SubmitAnswerRequest;
import com.englishapp.backend.content.dto.SubmitAnswerResponse;
import com.englishapp.backend.content.service.LessonService;
import com.englishapp.backend.progress.service.ExerciseGradingService;
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
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "Lesson content and exercise submission")
@SecurityRequirement(name = "bearerAuth")
public class LessonController {

    private final LessonService lessonService;
    private final ExerciseGradingService gradingService;

    @GetMapping("/{id}")
    @Operation(summary = "Get lesson detail with all exercises (options shown, correct answer hidden)")
    public ApiResponse<LessonDetailDto> getById(@PathVariable Long id) {
        return ApiResponse.of(lessonService.getById(id));
    }

    @PostMapping("/{lessonId}/exercises/{exerciseId}/submit")
    @Operation(summary = "Submit an answer for an exercise",
            description = """
                    Scoring rules:
                    - Correct answer → +10 XP, streak updated.
                    - Wrong answer → no XP deducted.
                    - Wrong ≥ 5 times on the same exercise → lesson marked FAILED, score reset.
                    - All exercises correct → lesson COMPLETED, +50 XP bonus.
                    """)
    public ApiResponse<SubmitAnswerResponse> submit(
            @PathVariable Long lessonId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody SubmitAnswerRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.of(
                gradingService.submit(userDetails.getUsername(), exerciseId, request.answer()));
    }

    @PostMapping("/{id}/restart")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Restart a failed lesson — clears attempt history and resets score")
    public void restart(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
        gradingService.restartLesson(userDetails.getUsername(), id);
    }
}
