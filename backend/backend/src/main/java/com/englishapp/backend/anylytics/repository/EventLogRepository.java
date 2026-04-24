package com.englishapp.backend.anylytics.repository;

import com.englishapp.backend.anylytics.entity.EventLog;
import com.englishapp.backend.anylytics.entity.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    Page<EventLog> findByUserId(UUID userId, Pageable pageable);

    Page<EventLog> findByEventType(EventType eventType, Pageable pageable);

    Page<EventLog> findByUserIdAndEventType(UUID userId, EventType eventType, Pageable pageable);

    // Returns pairs of [EventType, count] for the summary chart
    @Query("SELECT e.eventType, COUNT(e) FROM EventLog e GROUP BY e.eventType ORDER BY COUNT(e) DESC")
    List<Object[]> countByEventType();

    // Total events per user (top active users)
    @Query("SELECT e.userId, COUNT(e) FROM EventLog e WHERE e.userId IS NOT NULL GROUP BY e.userId ORDER BY COUNT(e) DESC")
    List<Object[]> countByUser(Pageable pageable);
}
