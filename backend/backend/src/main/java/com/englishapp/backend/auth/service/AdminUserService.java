package com.englishapp.backend.auth.service;

import com.englishapp.backend.auth.dto.AdminResetPasswordRequest;
import com.englishapp.backend.auth.dto.AdminUpdateUserRequest;
import com.englishapp.backend.auth.dto.AdminUserResponse;
import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.BadRequestException;
import com.englishapp.backend.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<AdminUserResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    public AdminUserResponse getUser(UUID id) {
        return toResponse(findById(id));
    }

    public AdminUserResponse updateUser(UUID id, AdminUpdateUserRequest request) {
        User user = findById(id);
        if (request.displayName() != null) user.setDisplayName(request.displayName());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl());
        if (request.role() != null) user.setRole(request.role());
        if (request.active() != null) user.setActive(request.active());
        if (request.xp() != null) {
            if (request.xp() < 0) throw new BadRequestException("XP cannot be negative");
            user.setXp(request.xp());
        }
        return toResponse(userRepository.save(user));
    }

    public void resetPassword(UUID id, AdminResetPasswordRequest request) {
        User user = findById(id);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    private User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getRole(),
                user.isActive(),
                user.getXp(),
                user.getStreakDays(),
                user.getLastStudiedAt(),
                user.getCreatedAt()
        );
    }
}
