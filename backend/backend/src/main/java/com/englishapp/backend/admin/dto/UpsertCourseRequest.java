package com.englishapp.backend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpsertCourseRequest(
        @NotBlank String name,
        String description,
        @NotBlank @Pattern(regexp = "A1|A2|B1|B2|C1|C2", message = "levelTarget must be A1, A2, B1, B2, C1, or C2")
        String levelTarget
) {}
