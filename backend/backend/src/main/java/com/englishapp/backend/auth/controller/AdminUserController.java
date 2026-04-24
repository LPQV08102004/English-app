package com.englishapp.backend.auth.controller;

import com.englishapp.backend.auth.dto.AdminResetPasswordRequest;
import com.englishapp.backend.auth.dto.AdminUpdateUserRequest;
import com.englishapp.backend.auth.dto.AdminUserResponse;
import com.englishapp.backend.auth.service.AdminUserService;
import com.englishapp.backend.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - Users", description = "Admin user management")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "List all users (paginated)")
    public ApiResponse<Page<AdminUserResponse>> listUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ApiResponse.of(adminUserService.listUsers(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by ID")
    public ApiResponse<AdminUserResponse> getUser(@PathVariable UUID id) {
        return ApiResponse.of(adminUserService.getUser(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user's details, role, or active status")
    public ApiResponse<AdminUserResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody AdminUpdateUserRequest request) {
        return ApiResponse.of(adminUserService.updateUser(id, request));
    }

    @PostMapping("/{id}/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reset a user's password")
    public void resetPassword(
            @PathVariable UUID id,
            @Valid @RequestBody AdminResetPasswordRequest request) {
        adminUserService.resetPassword(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a user permanently")
    public void deleteUser(@PathVariable UUID id) {
        adminUserService.deleteUser(id);
    }
}
