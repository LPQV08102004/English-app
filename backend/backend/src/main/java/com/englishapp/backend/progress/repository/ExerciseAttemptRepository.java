package com.englishapp.backend.progress.repository;

import com.englishapp.backend.progress.entity.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {

    // Count wrong attempts for one exercise since the session started
    @Query("""
            SELECT COUNT(a) FROM ExerciseAttempt a
            WHERE a.userId = :userId
              AND a.exercise.id = :exerciseId
              AND a.correct = false
              AND a.attemptedAt >= :since
            """)
    int countWrongAttemptsSince(@Param("userId") UUID userId,
                                @Param("exerciseId") Long exerciseId,
                                @Param("since") LocalDateTime since);

    // Count distinct exercises the user has answered correctly in this lesson session
    @Query("""
            SELECT COUNT(DISTINCT a.exercise.id) FROM ExerciseAttempt a
            WHERE a.userId = :userId
              AND a.lesson.id = :lessonId
              AND a.correct = true
              AND a.attemptedAt >= :since
            """)
    long countDistinctCorrectExercisesSince(@Param("userId") UUID userId,
                                            @Param("lessonId") Long lessonId,
                                            @Param("since") LocalDateTime since);

    // Delete all attempts for a lesson session on restart
    @Modifying
    @Query("DELETE FROM ExerciseAttempt a WHERE a.userId = :userId AND a.lesson.id = :lessonId")
    void deleteByUserIdAndLessonId(@Param("userId") UUID userId, @Param("lessonId") Long lessonId);

    // Admin: delete all attempts for an entire lesson (content deletion)
    @Modifying
    @Query("DELETE FROM ExerciseAttempt a WHERE a.lesson.id = :lessonId")
    void deleteByLessonId(@Param("lessonId") Long lessonId);
}
