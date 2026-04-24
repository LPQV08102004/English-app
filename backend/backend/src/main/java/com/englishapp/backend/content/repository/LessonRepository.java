package com.englishapp.backend.content.repository;

import com.englishapp.backend.content.entity.Course;
import com.englishapp.backend.content.entity.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseOrderByOrderIndex(Course course);
    Page<Lesson> findByCourse(Course course, Pageable pageable);
    long countByCourse(Course course);
}
