package com.englishapp.backend.auth.service;

import com.englishapp.backend.auth.dto.*;
import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.BadRequestException;
import com.englishapp.backend.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }
        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail());
        return toAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        String token = jwtService.generateToken(user.getEmail());
        return toAuthResponse(token, user);
    }

    public ProfileResponse getProfile(String email) {
        User user = findByEmail(email);
        return toProfileResponse(user);
    }

    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = findByEmail(email);
        if (request.displayName() != null) user.setDisplayName(request.displayName());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl());
        userRepository.save(user);
        return toProfileResponse(user);
    }

    // Called by other modules (e.g. progress) to credit XP and update streak
    public void addXp(UUID userId, int amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setXp(user.getXp() + amount);
        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = findByEmail(email);
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList()
        );
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private AuthResponse toAuthResponse(String token, User user) {
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getDisplayName(), user.getAvatarUrl(), user.getXp(), user.getStreakDays());
    }

    private ProfileResponse toProfileResponse(User user) {
        return new ProfileResponse(user.getId(), user.getEmail(), user.getDisplayName(),
                user.getAvatarUrl(), user.getXp(), user.getStreakDays(), user.getCreatedAt());
    }
}
