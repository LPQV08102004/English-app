package com.englishapp.backend.admin.controller;

import com.englishapp.backend.admin.dto.UpsertCourseRequest;
import com.englishapp.backend.admin.service.AdminContentService;
import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.content.dto.CourseResponse;
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
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@Tag(name = "Admin - Courses", description = "CRUD for courses (ROLE_ADMIN only)")
public class AdminCourseController {

    private final AdminContentService service;

    @GetMapping
    @Operation(summary = "List all courses (paginated)")
    public ApiResponse<Page<CourseResponse>> list(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.of(service.listCourses(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a course by ID")
    public ApiResponse<CourseResponse> get(@PathVariable Long id) {
        return ApiResponse.of(service.getCourse(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new course")
    public ApiResponse<CourseResponse> create(@Valid @RequestBody UpsertCourseRequest req) {
        return ApiResponse.of(service.createCourse(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a course")
    public ApiResponse<CourseResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody UpsertCourseRequest req) {
        return ApiResponse.of(service.updateCourse(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a course and all its lessons/exercises")
    public void delete(@PathVariable Long id) {
        service.deleteCourse(id);
    }
}
