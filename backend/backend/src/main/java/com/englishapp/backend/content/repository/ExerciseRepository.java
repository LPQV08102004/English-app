package com.englishapp.backend.content.repository;

import com.englishapp.backend.content.entity.Exercise;
import com.englishapp.backend.content.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByLesson(Lesson lesson);
    long countByLesson(Lesson lesson);

    @Modifying
    @Query("DELETE FROM Exercise e WHERE e.lesson.id = :lessonId")
    void deleteByLessonId(@Param("lessonId") Long lessonId);
}
