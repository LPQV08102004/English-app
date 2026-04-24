package com.englishapp.backend.vocab.entity;

import com.englishapp.backend.content.entity.Lesson;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "vocabularies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson; // nullable — word may belong to no specific lesson

    @Column(nullable = false, length = 100)
    private String word;

    @Column(nullable = false, length = 255)
    private String meaning; // Vietnamese meaning

    @Column(length = 100)
    private String ipa;

    @Column(name = "part_of_speech", length = 20)
    private String partOfSpeech; // n, v, adj, adv ...

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(name = "difficulty_level", length = 10)
    private String difficultyLevel; // A1, A2, B1 ...

    @Column(length = 50)
    private String topic;

    // Stores verb forms (v1/v2/v3) and plural form
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "grammar_info", columnDefinition = "jsonb")
    private Map<String, String> grammarInfo;
}
