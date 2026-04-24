package com.englishapp.backend.vocab.service;

import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.vocab.dto.MistakeReviewDto;
import com.englishapp.backend.vocab.dto.TopicPriorityDto;
import com.englishapp.backend.vocab.entity.UserMistake;
import com.englishapp.backend.vocab.entity.Vocabulary;
import com.englishapp.backend.vocab.repository.UserMistakeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final UserMistakeRepository mistakeRepo;
    private final UserRepository userRepo;

    // Words the user frequently gets wrong, sorted by mistake count desc
    public Page<MistakeReviewDto> getMistakes(String email, Pageable pageable) {
        User user = findUser(email);
        return mistakeRepo.findByUserIdOrderByMistakeCountDesc(user.getId(), pageable)
                .map(this::toDto);
    }

    // Topics ordered by total mistake count — for home screen priority
    public List<TopicPriorityDto> getTopicPriority(String email) {
        User user = findUser(email);
        return mistakeRepo.findTopicsByMistakeCount(user.getId());
    }

    // Mark a vocabulary as reviewed (resets mistake count)
    @Transactional
    public void markReviewed(String email, Long mistakeId) {
        User user = findUser(email);
        UserMistake mistake = mistakeRepo.findById(mistakeId)
                .orElseThrow(() -> new NotFoundException("Mistake record not found"));
        if (!mistake.getUserId().equals(user.getId())) {
            throw new com.englishapp.backend.common.exception.BadRequestException(
                    "Not authorized to update this record");
        }
        mistake.setMistakeCount(0);
        mistake.setLastReviewedAt(LocalDateTime.now());
        mistakeRepo.save(mistake);
    }

    // ── Internal: called by ExerciseGradingService ────────────────────────

    @Transactional
    public void recordMistake(java.util.UUID userId, Vocabulary vocabulary) {
        mistakeRepo.findByUserIdAndVocabulary_Id(userId, vocabulary.getId())
                .ifPresentOrElse(
                        m -> {
                            m.setMistakeCount(m.getMistakeCount() + 1);
                            m.setLastReviewedAt(LocalDateTime.now());
                            mistakeRepo.save(m);
                        },
                        () -> mistakeRepo.save(UserMistake.builder()
                                .userId(userId)
                                .vocabulary(vocabulary)
                                .build())
                );
    }

    private MistakeReviewDto toDto(UserMistake m) {
        Vocabulary v = m.getVocabulary();
        return new MistakeReviewDto(v.getId(), v.getWord(), v.getMeaning(),
                v.getIpa(), v.getTopic(), v.getDifficultyLevel(),
                m.getMistakeCount(), m.getLastReviewedAt());
    }

    private User findUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
