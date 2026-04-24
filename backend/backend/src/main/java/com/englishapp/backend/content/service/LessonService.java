package com.englishapp.backend.content.service;

import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.content.dto.ExerciseDto;
import com.englishapp.backend.content.dto.LessonDetailDto;
import com.englishapp.backend.content.entity.Lesson;
import com.englishapp.backend.content.repository.ExerciseRepository;
import com.englishapp.backend.content.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ExerciseRepository exerciseRepository;

    public LessonDetailDto getById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lesson not found"));

        List<ExerciseDto> exercises = exerciseRepository.findByLesson(lesson).stream()
                .map(e -> new ExerciseDto(e.getId(), e.getQuestion(),
                        e.getType().name(), e.getOptions()))
                .toList();

        return new LessonDetailDto(
                lesson.getId(), lesson.getName(),
                lesson.getCourse().getId(), lesson.getCourse().getName(),
                lesson.getOrderIndex(), exercises);
    }
}
