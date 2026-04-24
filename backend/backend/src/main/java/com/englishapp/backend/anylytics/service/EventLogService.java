package com.englishapp.backend.anylytics.service;

import com.englishapp.backend.anylytics.dto.EventLogDto;
import com.englishapp.backend.anylytics.dto.EventStatsDto;
import com.englishapp.backend.anylytics.entity.EventLog;
import com.englishapp.backend.anylytics.entity.EventType;
import com.englishapp.backend.anylytics.repository.EventLogRepository;
import com.englishapp.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventLogService {

    private final EventLogRepository eventLogRepo;
    private final UserRepository userRepo;

    // ── Async logging (fire-and-forget) ───────────────────────────────────────

    /**
     * Called from business services where userId is already resolved.
     * Runs asynchronously so it never blocks the main request thread.
     */
    @Async
    public void log(UUID userId, EventType type, Map<String, Object> metadata) {
        try {
            eventLogRepo.save(EventLog.builder()
                    .userId(userId)
                    .eventType(type)
                    .metadata(metadata)
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to persist event log [{} / {}]: {}", type, userId, ex.getMessage());
        }
    }

    /**
     * Called from the AOP aspect where only the Spring Security principal name (email) is available.
     */
    @Async
    public void log(String email, EventType type, Map<String, Object> metadata) {
        try {
            UUID userId = userRepo.findByEmail(email)
                    .map(u -> u.getId())
                    .orElse(null);
            eventLogRepo.save(EventLog.builder()
                    .userId(userId)
                    .eventType(type)
                    .metadata(metadata)
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to persist event log [{} / {}]: {}", type, email, ex.getMessage());
        }
    }

    // ── Query methods (admin) ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<EventLogDto> listEvents(UUID userId, EventType eventType, Pageable pageable) {
        Page<EventLog> page;
        if (userId != null && eventType != null) {
            page = eventLogRepo.findByUserIdAndEventType(userId, eventType, pageable);
        } else if (userId != null) {
            page = eventLogRepo.findByUserId(userId, pageable);
        } else if (eventType != null) {
            page = eventLogRepo.findByEventType(eventType, pageable);
        } else {
            page = eventLogRepo.findAll(pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public EventStatsDto getStats() {
        long total = eventLogRepo.count();

        Map<String, Long> countByType = new LinkedHashMap<>();
        for (Object[] row : eventLogRepo.countByEventType()) {
            countByType.put(((EventType) row[0]).name(), (Long) row[1]);
        }

        List<EventStatsDto.UserActivityDto> topUsers = eventLogRepo
                .countByUser(PageRequest.of(0, 10))
                .stream()
                .map(row -> new EventStatsDto.UserActivityDto((UUID) row[0], (Long) row[1]))
                .toList();

        return new EventStatsDto(total, countByType, topUsers);
    }

    private EventLogDto toDto(EventLog e) {
        return new EventLogDto(e.getId(), e.getUserId(), e.getEventType(),
                e.getMetadata(), e.getCreatedAt());
    }
}
