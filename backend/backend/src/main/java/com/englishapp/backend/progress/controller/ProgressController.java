package com.englishapp.backend.progress.controller;

import com.englishapp.backend.auth.repository.UserRepository;
import com.englishapp.backend.common.api.ApiResponse;
import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.content.entity.Course;
import com.englishapp.backend.content.repository.CourseRepository;
import com.englishapp.backend.content.repository.LessonRepository;
import com.englishapp.backend.progress.dto.LessonProgressDto;
import com.englishapp.backend.progress.repository.LessonProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @GetMapping("/courses/{courseId}")
    public ApiResponse<List<LessonProgressDto>> getCourseProgress(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));

        List<LessonProgressDto> result = lessonRepository.findByCourseOrderByOrderIndex(course)
                .stream()
                .map(lesson -> lessonProgressRepository
                        .findByUserIdAndLesson(userId, lesson)
                        .map(p -> new LessonProgressDto(lesson.getId(), p.getStatus().name(), p.getScore()))
                        .orElse(new LessonProgressDto(lesson.getId(), "NOT_STARTED", 0)))
                .toList();

        return ApiResponse.success(result);
    }
}
