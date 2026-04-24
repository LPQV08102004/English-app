package com.englishapp.backend.vocab.repository;

import com.englishapp.backend.vocab.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    @Query("""
            SELECT v FROM Vocabulary v
            WHERE LOWER(v.word) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(v.meaning) LIKE LOWER(CONCAT('%', :q, '%'))
            """)
    Page<Vocabulary> search(@Param("q") String q, Pageable pageable);

    Page<Vocabulary> findByDifficultyLevelOrderByWord(String level, Pageable pageable);

    Page<Vocabulary> findByTopicOrderByWord(String topic, Pageable pageable);

    List<String> findDistinctTopicBy();

    boolean existsByWord(String word);
}
