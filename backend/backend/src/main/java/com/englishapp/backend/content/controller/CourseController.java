package com.englishapp.backend.content.controller;

import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.content.dto.CourseResponse;
import com.englishapp.backend.content.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course catalog")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @Operation(summary = "List all courses ordered by CEFR level")
    public ApiResponse<List<CourseResponse>> listAll() {
        return ApiResponse.of(courseService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course detail with lesson list")
    public ApiResponse<CourseResponse> getById(@PathVariable Long id) {
        return ApiResponse.of(courseService.getById(id));
    }
}
