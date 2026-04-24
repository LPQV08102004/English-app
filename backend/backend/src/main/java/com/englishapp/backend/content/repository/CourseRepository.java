package com.englishapp.backend.content.repository;

import com.englishapp.backend.content.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findAllByOrderByLevelTarget();
}
