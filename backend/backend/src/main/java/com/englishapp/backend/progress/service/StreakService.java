package com.englishapp.backend.progress.service;

import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserRepository userRepository;

    /**
     * Call this whenever a user completes a study activity (lesson finish or correct answer).
     * Updates streak and credits XP atomically.
     */
    @Transactional
    public void recordActivity(UUID userId, int xpAmount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        updateStreak(user);
        user.setXp(user.getXp() + xpAmount);
        userRepository.save(user);
    }

    private void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastStudiedAt();

        if (last == null) {
            user.setStreakDays(1);
        } else if (last.equals(today)) {
            // Already recorded activity today — streak unchanged
            return;
        } else if (last.equals(today.minusDays(1))) {
            user.setStreakDays(user.getStreakDays() + 1);
        } else {
            // Gap of 2+ days — streak resets
            user.setStreakDays(1);
        }

        user.setLastStudiedAt(today);
    }
}
