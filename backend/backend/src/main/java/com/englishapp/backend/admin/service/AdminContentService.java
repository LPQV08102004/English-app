package com.englishapp.backend.admin.service;

import com.englishapp.backend.admin.dto.*;
import com.englishapp.backend.common.exception.BadRequestException;
import com.englishapp.backend.common.exception.NotFoundException;
import com.englishapp.backend.content.dto.CourseResponse;
import com.englishapp.backend.content.dto.LessonDetailDto;
import com.englishapp.backend.content.dto.LessonSummaryDto;
import com.englishapp.backend.content.dto.ExerciseDto;
import com.englishapp.backend.content.entity.Course;
import com.englishapp.backend.content.entity.Exercise;
import com.englishapp.backend.content.entity.ExerciseType;
import com.englishapp.backend.content.entity.Lesson;
import com.englishapp.backend.content.repository.CourseRepository;
import com.englishapp.backend.content.repository.ExerciseRepository;
import com.englishapp.backend.content.repository.LessonRepository;
import com.englishapp.backend.progress.repository.ExerciseAttemptRepository;
import com.englishapp.backend.progress.repository.LessonProgressRepository;
import com.englishapp.backend.vocab.dto.VocabEntryDto;
import com.englishapp.backend.vocab.entity.Vocabulary;
import com.englishapp.backend.vocab.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminContentService {

    private static final Set<String> VALID_LEVELS = Set.of("A1", "A2", "B1", "B2", "C1", "C2");

    private final CourseRepository courseRepo;
    private final LessonRepository lessonRepo;
    private final ExerciseRepository exerciseRepo;
    private final ExerciseAttemptRepository attemptRepo;
    private final LessonProgressRepository progressRepo;
    private final VocabularyRepository vocabRepo;

    // ── Course ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CourseResponse> listCourses(Pageable pageable) {
        return courseRepo.findAll(pageable).map(this::toCourseResponse);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long id) {
        return toCourseResponse(findCourse(id));
    }

    public CourseResponse createCourse(UpsertCourseRequest req) {
        Course course = Course.builder()
                .name(req.name())
                .description(req.description())
                .levelTarget(req.levelTarget())
                .build();
        return toCourseResponse(courseRepo.save(course));
    }

    public CourseResponse updateCourse(Long id, UpsertCourseRequest req) {
        Course course = findCourse(id);
        course.setName(req.name());
        course.setDescription(req.description());
        course.setLevelTarget(req.levelTarget());
        return toCourseResponse(courseRepo.save(course));
    }

    public void deleteCourse(Long id) {
        Course course = findCourse(id);
        List<Lesson> lessons = lessonRepo.findByCourseOrderByOrderIndex(course);
        for (Lesson lesson : lessons) {
            deleteLessonInternal(lesson.getId());
        }
        courseRepo.delete(course);
    }

    // ── Lesson ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<LessonDetailDto> listLessons(Long courseId, Pageable pageable) {
        // Paginated flat list scoped to a course (or all if courseId is null)
        if (courseId != null) {
            Course course = findCourse(courseId);
            return lessonRepo.findByCourse(course, pageable).map(this::toLessonDetail);
        }
        return lessonRepo.findAll(pageable).map(this::toLessonDetail);
    }

    @Transactional(readOnly = true)
    public LessonDetailDto getLesson(Long id) {
        return toLessonDetail(findLesson(id));
    }

    public LessonDetailDto createLesson(UpsertLessonRequest req) {
        Course course = findCourse(req.courseId());
        Lesson lesson = Lesson.builder()
                .course(course)
                .name(req.name())
                .orderIndex(req.orderIndex())
                .build();
        return toLessonDetail(lessonRepo.save(lesson));
    }

    public LessonDetailDto updateLesson(Long id, UpsertLessonRequest req) {
        Lesson lesson = findLesson(id);
        Course course = findCourse(req.courseId());
        lesson.setCourse(course);
        lesson.setName(req.name());
        lesson.setOrderIndex(req.orderIndex());
        return toLessonDetail(lessonRepo.save(lesson));
    }

    public void deleteLesson(Long id) {
        findLesson(id); // ensure exists
        deleteLessonInternal(id);
    }

    // ── Exercise ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminExerciseDto> listExercises(Long lessonId) {
        Lesson lesson = findLesson(lessonId);
        return exerciseRepo.findByLesson(lesson).stream()
                .map(this::toAdminExerciseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminExerciseDto getExercise(Long id) {
        return toAdminExerciseDto(findExercise(id));
    }

    public AdminExerciseDto createExercise(UpsertExerciseRequest req) {
        Lesson lesson = findLesson(req.lessonId());
        validateExercise(req);
        Vocabulary vocab = req.vocabularyId() != null ? findVocab(req.vocabularyId()) : null;

        Exercise exercise = Exercise.builder()
                .lesson(lesson)
                .question(req.question())
                .type(req.type())
                .options(req.options())
                .correctAnswer(req.correctAnswer())
                .vocabulary(vocab)
                .build();
        return toAdminExerciseDto(exerciseRepo.save(exercise));
    }

    public AdminExerciseDto updateExercise(Long id, UpsertExerciseRequest req) {
        Exercise exercise = findExercise(id);
        Lesson lesson = findLesson(req.lessonId());
        validateExercise(req);
        Vocabulary vocab = req.vocabularyId() != null ? findVocab(req.vocabularyId()) : null;

        exercise.setLesson(lesson);
        exercise.setQuestion(req.question());
        exercise.setType(req.type());
        exercise.setOptions(req.options());
        exercise.setCorrectAnswer(req.correctAnswer());
        exercise.setVocabulary(vocab);
        return toAdminExerciseDto(exerciseRepo.save(exercise));
    }

    public void deleteExercise(Long id) {
        Exercise exercise = findExercise(id);
        exerciseRepo.delete(exercise);
    }

    // ── Vocabulary ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<VocabEntryDto> listVocab(String level, String topic, Pageable pageable) {
        if (level != null)  return vocabRepo.findByDifficultyLevelOrderByWord(level, pageable).map(this::toVocabDto);
        if (topic != null)  return vocabRepo.findByTopicOrderByWord(topic, pageable).map(this::toVocabDto);
        return vocabRepo.findAll(pageable).map(this::toVocabDto);
    }

    @Transactional(readOnly = true)
    public VocabEntryDto getVocab(Long id) {
        return toVocabDto(findVocab(id));
    }

    public VocabEntryDto createVocab(UpsertVocabRequest req) {
        Lesson lesson = req.lessonId() != null ? findLesson(req.lessonId()) : null;
        Vocabulary vocab = Vocabulary.builder()
                .lesson(lesson)
                .word(req.word())
                .meaning(req.meaning())
                .ipa(req.ipa())
                .partOfSpeech(req.partOfSpeech())
                .audioUrl(req.audioUrl())
                .example(req.example())
                .difficultyLevel(req.difficultyLevel())
                .topic(req.topic())
                .grammarInfo(req.grammarInfo())
                .build();
        return toVocabDto(vocabRepo.save(vocab));
    }

    public VocabEntryDto updateVocab(Long id, UpsertVocabRequest req) {
        Vocabulary vocab = findVocab(id);
        Lesson lesson = req.lessonId() != null ? findLesson(req.lessonId()) : null;
        vocab.setLesson(lesson);
        vocab.setWord(req.word());
        vocab.setMeaning(req.meaning());
        vocab.setIpa(req.ipa());
        vocab.setPartOfSpeech(req.partOfSpeech());
        vocab.setAudioUrl(req.audioUrl());
        vocab.setExample(req.example());
        vocab.setDifficultyLevel(req.difficultyLevel());
        vocab.setTopic(req.topic());
        vocab.setGrammarInfo(req.grammarInfo());
        return toVocabDto(vocabRepo.save(vocab));
    }

    public void deleteVocab(Long id) {
        if (!vocabRepo.existsById(id)) throw new NotFoundException("Vocabulary not found");
        vocabRepo.deleteById(id);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void deleteLessonInternal(Long lessonId) {
        // Delete in dependency order so FK constraints are satisfied
        attemptRepo.deleteByLessonId(lessonId);
        progressRepo.deleteByLessonId(lessonId);
        exerciseRepo.deleteByLessonId(lessonId);
        lessonRepo.deleteById(lessonId);
    }

    private void validateExercise(UpsertExerciseRequest req) {
        if (req.type() == ExerciseType.MULTIPLE_CHOICE) {
            if (req.options() == null || req.options().size() < 2) {
                throw new BadRequestException("MULTIPLE_CHOICE requires at least 2 options");
            }
            if (!req.options().contains(req.correctAnswer())) {
                throw new BadRequestException("correctAnswer must be one of the provided options");
            }
        }
    }

    private Course findCourse(Long id) {
        return courseRepo.findById(id).orElseThrow(() -> new NotFoundException("Course not found"));
    }

    private Lesson findLesson(Long id) {
        return lessonRepo.findById(id).orElseThrow(() -> new NotFoundException("Lesson not found"));
    }

    private Exercise findExercise(Long id) {
        return exerciseRepo.findById(id).orElseThrow(() -> new NotFoundException("Exercise not found"));
    }

    private Vocabulary findVocab(Long id) {
        return vocabRepo.findById(id).orElseThrow(() -> new NotFoundException("Vocabulary not found"));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private CourseResponse toCourseResponse(Course c) {
        List<LessonSummaryDto> lessons = lessonRepo.findByCourseOrderByOrderIndex(c)
                .stream().map(l -> new LessonSummaryDto(l.getId(), l.getName(), l.getOrderIndex())).toList();
        return new CourseResponse(c.getId(), c.getName(), c.getDescription(),
                c.getLevelTarget(), lessons.size(), lessons);
    }

    private LessonDetailDto toLessonDetail(Lesson l) {
        List<ExerciseDto> exercises = exerciseRepo.findByLesson(l).stream()
                .map(e -> new ExerciseDto(e.getId(), e.getQuestion(), e.getType().name(), e.getOptions()))
                .toList();
        return new LessonDetailDto(l.getId(), l.getName(),
                l.getCourse().getId(), l.getCourse().getName(), l.getOrderIndex(), exercises);
    }

    private AdminExerciseDto toAdminExerciseDto(Exercise e) {
        Long vocabId = e.getVocabulary() != null ? e.getVocabulary().getId() : null;
        return new AdminExerciseDto(e.getId(), e.getLesson().getId(), e.getLesson().getName(),
                e.getQuestion(), e.getType().name(), e.getOptions(), e.getCorrectAnswer(), vocabId);
    }

    private VocabEntryDto toVocabDto(Vocabulary v) {
        return new VocabEntryDto(v.getId(), v.getWord(), v.getMeaning(), v.getIpa(),
                v.getPartOfSpeech(), v.getTopic(), v.getDifficultyLevel(),
                v.getAudioUrl(), v.getExample(), v.getGrammarInfo());
    }
}
