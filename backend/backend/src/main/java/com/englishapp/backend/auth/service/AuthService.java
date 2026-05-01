package com.englishapp.backend.auth.service;

import com.englishapp.backend.auth.dto.*;
import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.BadRequestException;
import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.progress.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StreakService streakService;

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

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    // Called by other modules to credit XP and update streak together
    public void recordActivity(UUID userId, int xpAmount) {
        streakService.recordActivity(userId, xpAmount);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = findByEmail(email);
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
    private ProfileResponse toProfileResponse(User user) {
        return new ProfileResponse(user.getId(), user.getEmail(), user.getDisplayName(),
                user.getAvatarUrl(), user.getXp(), user.getStreakDays(), user.getCreatedAt());
    }



    private AuthResponse toAuthResponse(String token, User user) {
        return new AuthResponse(token, user.getId(), user.getEmail(),
                user.getDisplayName(), user.getAvatarUrl(), user.getXp(), user.getStreakDays(),
                user.getRole().name());
    }


}
