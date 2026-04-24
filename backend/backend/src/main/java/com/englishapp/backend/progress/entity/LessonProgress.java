package com.englishapp.backend.progress.entity;

import com.englishapp.backend.content.entity.Lesson;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_lesson_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LessonStatus status = LessonStatus.IN_PROGRESS;

    @Builder.Default
    @Column(nullable = false)
    private int score = 0;

    // Marks the start of the current attempt session — used to scope wrong-attempt counts
    @Builder.Default
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
