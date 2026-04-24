package com.englishapp.backend.vocab.repository;

import com.englishapp.backend.vocab.entity.VocabSaved;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VocabSavedRepository extends JpaRepository<VocabSaved, Long> {
    Page<VocabSaved> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Optional<VocabSaved> findByUserIdAndWord(UUID userId, String word);
    boolean existsByUserIdAndWord(UUID userId, String word);
}
