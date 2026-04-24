package com.englishapp.backend.progress.service;

import com.englishapp.backend.auth.entity.User;
import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.exception.BadRequestException;
import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.content.dto.SubmitAnswerResponse;
import com.englishapp.backend.content.entity.Exercise;
import com.englishapp.backend.content.entity.Lesson;
import com.englishapp.backend.content.repository.ExerciseRepository;
import com.englishapp.backend.progress.XpReward;
import com.englishapp.backend.progress.entity.ExerciseAttempt;
import com.englishapp.backend.progress.entity.LessonProgress;
import com.englishapp.backend.progress.entity.LessonStatus;
import com.englishapp.backend.progress.repository.ExerciseAttemptRepository;
import com.englishapp.backend.anylytics.entity.EventType;
import com.englishapp.backend.anylytics.service.EventLogService;
import com.englishapp.backend.progress.repository.LessonProgressRepository;
import com.englishapp.backend.vocab.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExerciseGradingService {

    private static final int MAX_WRONG_ATTEMPTS = 5;

    private final ExerciseRepository exerciseRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final UserRepository userRepository;
    private final StreakService streakService;
    private final ReviewService reviewService;
    private final EventLogService eventLogService;

    @Transactional
    public SubmitAnswerResponse submit(String email, Long exerciseId, String userAnswer) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new NotFoundException("Exercise not found"));

        Lesson lesson = exercise.getLesson();

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLesson(user.getId(), lesson)
                .orElseGet(() -> createProgress(user.getId(), lesson));

        if (progress.getStatus() == LessonStatus.FAILED) {
            throw new BadRequestException(
                    "Lesson failed due to too many wrong answers. POST /api/lessons/" +
                    lesson.getId() + "/restart to try again.");
        }
        if (progress.getStatus() == LessonStatus.COMPLETED) {
            throw new BadRequestException("Lesson already completed.");
        }

        boolean correct = grade(exercise, userAnswer);

        exerciseAttemptRepository.save(ExerciseAttempt.builder()
                .userId(user.getId())
                .lesson(lesson)
                .exercise(exercise)
                .userAnswer(userAnswer)
                .correct(correct)
                .build());

        if (correct) {
            return handleCorrect(user, exercise, lesson, progress);
        } else {
            return handleWrong(user, exercise, progress);
        }
    }

    @Transactional
    public void restartLesson(String email, Long lessonId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseThrow(() -> new NotFoundException("No progress found for this lesson."));

        if (progress.getStatus() != LessonStatus.FAILED) {
            throw new BadRequestException("Lesson is not in a failed state.");
        }

        exerciseAttemptRepository.deleteByUserIdAndLessonId(user.getId(), lessonId);

        progress.setStatus(LessonStatus.IN_PROGRESS);
        progress.setScore(0);
        progress.setStartedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private SubmitAnswerResponse handleCorrect(User user, Exercise exercise,
                                               Lesson lesson, LessonProgress progress) {
        streakService.recordActivity(user.getId(), XpReward.CORRECT_ANSWER);
        progress.setScore(progress.getScore() + XpReward.CORRECT_ANSWER);
        progress.setUpdatedAt(LocalDateTime.now());

        long totalExercises = exerciseRepository.countByLesson(lesson);
        long correctSoFar = exerciseAttemptRepository.countDistinctCorrectExercisesSince(
                user.getId(), lesson.getId(), progress.getStartedAt());

        boolean lessonCompleted = correctSoFar >= totalExercises;
        int bonusXp = 0;

        if (lessonCompleted) {
            progress.setStatus(LessonStatus.COMPLETED);
            streakService.recordActivity(user.getId(), XpReward.LESSON_COMPLETE);
            bonusXp = XpReward.LESSON_COMPLETE;
            eventLogService.log(user.getId(), EventType.FINISH_LESSON,
                    Map.of("lessonId", lesson.getId(), "score", progress.getScore()));
        }

        lessonProgressRepository.save(progress);

        eventLogService.log(user.getId(), EventType.ANSWER_CORRECT,
                Map.of("exerciseId", exercise.getId(), "lessonId", lesson.getId()));

        return new SubmitAnswerResponse(true, XpReward.CORRECT_ANSWER, 0, false, lessonCompleted, bonusXp);
    }

    private SubmitAnswerResponse handleWrong(User user, Exercise exercise, LessonProgress progress) {
        // Track vocabulary mistake if exercise is linked to a vocabulary entry
        if (exercise.getVocabulary() != null) {
            reviewService.recordMistake(user.getId(), exercise.getVocabulary());
        }

        int wrongCount = exerciseAttemptRepository.countWrongAttemptsSince(
                user.getId(), exercise.getId(), progress.getStartedAt());

        eventLogService.log(user.getId(), EventType.ANSWER_WRONG,
                Map.of("exerciseId", exercise.getId(), "lessonId", exercise.getLesson().getId(),
                       "wrongAttempts", wrongCount));

        if (wrongCount >= MAX_WRONG_ATTEMPTS) {
            progress.setStatus(LessonStatus.FAILED);
            progress.setScore(0);
            progress.setUpdatedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
            return new SubmitAnswerResponse(false, 0, wrongCount, true, false, 0);
        }

        return new SubmitAnswerResponse(false, 0, wrongCount, false, false, 0);
    }

    private boolean grade(Exercise exercise, String userAnswer) {
        return userAnswer.trim().equalsIgnoreCase(exercise.getCorrectAnswer().trim());
    }

    private LessonProgress createProgress(java.util.UUID userId, Lesson lesson) {
        return lessonProgressRepository.save(LessonProgress.builder()
                .userId(userId)
                .lesson(lesson)
                .build());
    }
}
