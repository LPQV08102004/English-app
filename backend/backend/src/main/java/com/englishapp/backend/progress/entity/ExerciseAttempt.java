package com.englishapp.backend.progress.entity;

import com.englishapp.backend.content.entity.Exercise;
import com.englishapp.backend.content.entity.Lesson;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exercise_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_item_id", nullable = false)
    private Exercise exercise;

    @Column(name = "user_answer", nullable = false, columnDefinition = "TEXT")
    private String userAnswer;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Builder.Default
    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();
}
