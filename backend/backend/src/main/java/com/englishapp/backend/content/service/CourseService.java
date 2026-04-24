package com.englishapp.backend.content.service;

import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.content.dto.CourseResponse;
import com.englishapp.backend.content.dto.LessonSummaryDto;
import com.englishapp.backend.content.entity.Course;
import com.englishapp.backend.content.repository.CourseRepository;
import com.englishapp.backend.content.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public List<CourseResponse> listAll() {
        return courseRepository.findAllByOrderByLevelTarget().stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        return toResponse(course);
    }

    private CourseResponse toResponse(Course course) {
        List<LessonSummaryDto> lessons = lessonRepository.findByCourseOrderByOrderIndex(course)
                .stream()
                .map(l -> new LessonSummaryDto(l.getId(), l.getName(), l.getOrderIndex()))
                .toList();
        return new CourseResponse(
                course.getId(), course.getName(), course.getDescription(),
                course.getLevelTarget(), lessons.size(), lessons);
    }
}
