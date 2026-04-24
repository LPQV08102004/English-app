package com.englishapp.backend.admin.controller;

import com.englishapp.backend.admin.dto.UpsertLessonRequest;
import com.englishapp.backend.admin.service.AdminContentService;
import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.content.dto.LessonDetailDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/lessons")
@RequiredArgsConstructor
@Tag(name = "Admin - Lessons", description = "CRUD for lessons (ROLE_ADMIN only)")
public class AdminLessonController {

    private final AdminContentService service;

    @GetMapping
    @Operation(summary = "List lessons — filter by courseId using ?courseId=1")
    public ApiResponse<Page<LessonDetailDto>> list(
            @RequestParam(required = false) Long courseId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(service.listLessons(courseId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a lesson by ID")
    public ApiResponse<LessonDetailDto> get(@PathVariable Long id) {
        return ApiResponse.of(service.getLesson(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new lesson")
    public ApiResponse<LessonDetailDto> create(@Valid @RequestBody UpsertLessonRequest req) {
        return ApiResponse.of(service.createLesson(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lesson (name, course, order)")
    public ApiResponse<LessonDetailDto> update(@PathVariable Long id,
                                               @Valid @RequestBody UpsertLessonRequest req) {
        return ApiResponse.of(service.updateLesson(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a lesson and all its exercises, progress, and attempt history")
    public void delete(@PathVariable Long id) {
        service.deleteLesson(id);
    }
}
