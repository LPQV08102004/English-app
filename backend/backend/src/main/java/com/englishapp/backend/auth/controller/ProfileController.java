package com.englishapp.backend.auth.controller;

import com.englishapp.backend.auth.dto.ChangePasswordRequest;
import com.englishapp.backend.auth.dto.ProfileResponse;
import com.englishapp.backend.auth.dto.ProfileUpdateRequest;
import com.englishapp.backend.auth.service.AuthService;
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
@RequestMapping("/api/me")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Current user profile")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ApiResponse<ProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ApiResponse.of(authService.getProfile(userDetails.getUsername()));
    }

    @PutMapping
    @Operation(summary = "Update display name or avatar")
    public ApiResponse<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileUpdateRequest request) {
        return ApiResponse.of(authService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Change current user's password")
    public void changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
    }
}
