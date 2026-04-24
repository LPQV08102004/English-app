package com.englishapp.backend.admin.controller;

import com.englishapp.backend.admin.dto.AdminExerciseDto;
import com.englishapp.backend.admin.dto.UpsertExerciseRequest;
import com.englishapp.backend.admin.service.AdminContentService;
import com.englishapp.backend.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/exercises")
@RequiredArgsConstructor
@Tag(name = "Admin - Exercises", description = "CRUD for exercises — correctAnswer visible (ROLE_ADMIN only)")
public class AdminExerciseController {

    private final AdminContentService service;

    @GetMapping
    @Operation(summary = "List all exercises for a lesson (?lessonId=1 required)")
    public ApiResponse<List<AdminExerciseDto>> list(@RequestParam Long lessonId) {
        return ApiResponse.of(service.listExercises(lessonId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an exercise by ID (includes correctAnswer)")
    public ApiResponse<AdminExerciseDto> get(@PathVariable Long id) {
        return ApiResponse.of(service.getExercise(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new exercise",
            description = """
                    Rules:
                    - MULTIPLE_CHOICE: options required (≥2), correctAnswer must be in options.
                    - FILL_IN_THE_BLANK: options can be omitted; correctAnswer is the expected text.
                    - vocabularyId (optional): links exercise to a vocabulary entry for mistake tracking.
                    """)
    public ApiResponse<AdminExerciseDto> create(@Valid @RequestBody UpsertExerciseRequest req) {
        return ApiResponse.of(service.createExercise(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an exercise")
    public ApiResponse<AdminExerciseDto> update(@PathVariable Long id,
                                                @Valid @RequestBody UpsertExerciseRequest req) {
        return ApiResponse.of(service.updateExercise(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an exercise")
    public void delete(@PathVariable Long id) {
        service.deleteExercise(id);
    }
}
