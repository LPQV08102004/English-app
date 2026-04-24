package com.englishapp.backend.progress.repository;

import com.englishapp.backend.content.entity.Lesson;
import com.englishapp.backend.progress.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUserIdAndLesson(UUID userId, Lesson lesson);
    Optional<LessonProgress> findByUserIdAndLessonId(UUID userId, Long lessonId);

    @Modifying
    @Query("DELETE FROM LessonProgress p WHERE p.lesson.id = :lessonId")
    void deleteByLessonId(@Param("lessonId") Long lessonId);
}
