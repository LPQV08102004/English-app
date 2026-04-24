package com.englishapp.backend.vocab.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_mistakes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "vocabulary_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMistake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id", nullable = false)
    private Vocabulary vocabulary;

    @Builder.Default
    @Column(name = "mistake_count", nullable = false)
    private int mistakeCount = 1;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;
}
