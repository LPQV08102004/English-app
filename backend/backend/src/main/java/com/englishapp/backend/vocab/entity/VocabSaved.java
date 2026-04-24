package com.englishapp.backend.vocab.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vocab_saved",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "word"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabSaved {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 200)
    private String word;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(columnDefinition = "TEXT")
    private String note;

    // "dictionary" | "manual"
    @Builder.Default
    @Column(nullable = false, length = 50)
    private String source = "manual";

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
