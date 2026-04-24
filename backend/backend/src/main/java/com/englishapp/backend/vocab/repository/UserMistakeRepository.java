package com.englishapp.backend.vocab.repository;

import com.englishapp.backend.vocab.dto.TopicPriorityDto;
import com.englishapp.backend.vocab.entity.UserMistake;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserMistakeRepository extends JpaRepository<UserMistake, Long> {

    Optional<UserMistake> findByUserIdAndVocabulary_Id(UUID userId, Long vocabularyId);

    Page<UserMistake> findByUserIdOrderByMistakeCountDesc(UUID userId, Pageable pageable);

    // Topics sorted by total mistake count — used for home screen priority
    @Query("""
            SELECT new com.englishapp.backend.vocab.dto.TopicPriorityDto(v.topic, SUM(m.mistakeCount))
            FROM UserMistake m JOIN m.vocabulary v
            WHERE m.userId = :userId AND v.topic IS NOT NULL
            GROUP BY v.topic
            ORDER BY SUM(m.mistakeCount) DESC
            """)
    List<TopicPriorityDto> findTopicsByMistakeCount(@Param("userId") UUID userId);
}
