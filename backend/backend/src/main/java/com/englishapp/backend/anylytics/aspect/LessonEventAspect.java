package com.englishapp.backend.anylytics.aspect;

import com.englishapp.backend.anylytics.entity.EventType;
import com.englishapp.backend.anylytics.service.EventLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Intercepts LessonService.getById() and fires a START_LESSON event without
 * touching any business logic. Uses Spring Security's SecurityContextHolder
 * to resolve the current user without introducing extra method parameters.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LessonEventAspect {

    private final EventLogService eventLogService;

    @AfterReturning(
            pointcut = "execution(* com.englishapp.backend.content.service.LessonService.getById(Long))"
    )
    public void onLessonAccessed(JoinPoint jp) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return;
        }

        Long lessonId = (Long) jp.getArgs()[0];
        String email = auth.getName();

        // Fire-and-forget: logged asynchronously, never blocks the HTTP response
        eventLogService.log(email, EventType.START_LESSON, Map.of("lessonId", lessonId));
    }
}
