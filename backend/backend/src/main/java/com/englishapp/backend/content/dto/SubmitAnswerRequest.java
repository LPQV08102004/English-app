package com.englishapp.backend.content.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitAnswerRequest(@NotBlank String answer) {}
