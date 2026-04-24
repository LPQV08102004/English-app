# Development Plan — English Learning App

> Cập nhật lần cuối: 2026-04-24

---

## Trạng thái ký hiệu
- ✅ Hoàn thành
- 🔄 Một phần (có code nhưng chưa đầy đủ)
- ❌ Chưa bắt đầu

---

## Module 1 — Common / Infrastructure

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 1.1 | `ApiResponse<T>`, `ApiError` | ✅ | `common/api/` |
| 1.2 | `GlobalExceptionHandler` (404, 400, 422) | ✅ | `common/exception/` |
| 1.3 | `NotFoundException`, `BadRequestException` | ✅ | |
| 1.4 | `SecurityConfig` — JWT stateless, role-based | ✅ | Admin route guard done |
| 1.5 | `CorsConfig`, `OpenApiConfig`, `JacksonConfig` | ✅ | |
| 1.6 | `AuditableEntity` + `JpaAuditingConfig` | ❌ | Chưa có, dùng manual `createdAt` trong User |
| 1.7 | `TimeUtil`, `JsonUtil` | ❌ | |
| 1.8 | DB migration (Flyway V1__init.sql, V2__seed) | ❌ | Đang dùng `ddl-auto=update` thay thế |

---

## Module 2 — Auth & Profile

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 2.1 | `User` entity (email, password, xp, streak, role, active) | ✅ | |
| 2.2 | `Role` enum (`ROLE_USER`, `ROLE_ADMIN`) | ✅ | |
| 2.3 | `UserRepository` | ✅ | |
| 2.4 | `JwtService` (generate + validate token) | ✅ | |
| 2.5 | `JwtAuthFilter` | ✅ | |
| 2.6 | `AuthService` (register + login) | ✅ | |
| 2.7 | `AuthController` — `POST /api/auth/register`, `POST /api/auth/login` | ✅ | |
| 2.8 | `ProfileController` — `GET /api/me`, `PUT /api/me`, `POST /api/me/change-password` | ✅ | |
| 2.9 | DTOs: `LoginRequest`, `RegisterRequest`, `AuthResponse`, `ProfileResponse`, `ProfileUpdateRequest`, `ChangePasswordRequest` | ✅ | |
| 2.10 | Streak logic (tự động reset nếu không học > 24h) | ✅ | `progress/service/StreakService.recordActivity()` |
| 2.11 | XP cộng điểm khi hoàn thành bài học / trả lời đúng | ✅ | `XpReward.LESSON_COMPLETE=50`, `XpReward.CORRECT_ANSWER=10`; `AuthService.recordActivity()` delegate sang StreakService |

---

## Module 3 — Admin User Management

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 3.1 | `AdminUserController` — list, get, update, reset-password, delete | ✅ | |
| 3.2 | `AdminUserService` | ✅ | |
| 3.3 | DTOs: `AdminUserResponse`, `AdminUpdateUserRequest`, `AdminResetPasswordRequest` | ✅ | |

---

## Module 4 — Content (Course / Lesson / Exercise)

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 4.1 | `Course` entity (id, name, description, level/CEFR) | ✅ | `Long` id, `@GeneratedValue(IDENTITY)`, `level_target` |
| 4.2 | `Lesson` entity | ✅ | `@ManyToOne Course`, `orderIndex` |
| 4.3 | `Exercise` entity (multiple-choice, fill-in-the-blank) | ✅ | `ExerciseType` enum, `options` JSONB, `correctAnswer` |
| 4.4 | `CourseRepository`, `LessonRepository`, `ExerciseRepository` | ✅ | |
| 4.5 | `CourseService`, `LessonService` | ✅ | |
| 4.6 | `CourseController` — `GET /api/courses`, `GET /api/courses/{id}` | ✅ | |
| 4.7 | `LessonController` — `GET /api/lessons/{id}`, `POST .../submit`, `POST .../restart` | ✅ | |
| 4.8 | DTOs: `CourseResponse`, `LessonSummaryDto`, `LessonDetailDto`, `ExerciseDto`, `SubmitAnswerRequest/Response` | ✅ | |
| 4.9 | Logic chấm điểm: đúng +10XP, sai không trừ, sai ≥5 lần → FAILED + restart | ✅ | `ExerciseGradingService` |
| 4.10 | Logic mở khóa dạng "Điền từ vựng mới" khi đạt ngưỡng Level | ❌ | Roadmap — sau khi vocab module xong |

---

## Module 5 — Progress & Submission

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 5.1 | `LessonProgress` entity | ✅ | `LessonStatus` enum (IN_PROGRESS/COMPLETED/FAILED), `startedAt` for session scoping |
| 5.2 | `ExerciseAttempt` entity | ✅ | tracks `userId`, `lesson`, `exercise`, `userAnswer`, `isCorrect` |
| 5.3 | `LessonProgressRepository`, `ExerciseAttemptRepository` | ✅ | custom @Query for wrong count + correct distinct count |
| 5.4 | `ExerciseGradingService` | ✅ | submit + restartLesson |
| 5.5 | `StreakService` (streak reset + update mỗi khi học) | ✅ | |
| 5.6 | Submit endpoint tích hợp trong `LessonController` | ✅ | `POST /api/lessons/{lessonId}/exercises/{exerciseId}/submit` |
| 5.7 | `SubmitAnswerRequest/Response` | ✅ | correct, xpEarned, wrongAttempts, lessonFailed, lessonCompleted, bonusXp |
| 5.8 | Feedback đúng/sai kèm trạng thái session | ✅ | |
| 5.9 | Retry logic: sai ≥5 lần → FAILED, `POST /api/lessons/{id}/restart` | ✅ | xóa attempts + reset progress |
| 5.10 | Level system: 80% hoàn thành khóa = hoàn thành Level | ❌ | |

---

## Module 6 — Vocabulary Tools

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 6.1 | `VocabSaved` entity (bookmark từ vựng) | ✅ | |
| 6.2 | `Vocabulary` entity + `UserMistake` entity | ✅ | seed từ `vocabulary_school.json` qua `VocabularyDataInitializer` |
| 6.3 | `VocabularyRepository`, `VocabSavedRepository`, `UserMistakeRepository` | ✅ | |
| 6.4 | `VocabService` (search EN/VI, filter by level/topic, save/unsave bookmark) | ✅ | |
| 6.5 | `ReviewService` (mistakes sorted by count, topic priority, mark reviewed) | ✅ | |
| 6.6 | `VocabController` — đầy đủ endpoints dictionary + saved + mistakes + topics | ✅ | |
| 6.7 | Từ điển Anh-Việt / Việt-Anh từ `vocabulary_school.json` (100 từ topic school) | ✅ | Auto-seed khi app khởi động |
| 6.8 | Topic priority: `GET /api/vocab/topics/priority` đẩy topic sai nhiều lên đầu | ✅ | JPQL GROUP BY topic, ORDER BY SUM(mistakeCount) DESC |

---

## Module 7 — Admin Content Management (CMS)

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 7.1 | `AdminCourseController` — CRUD Course | ✅ | `/api/admin/courses` |
| 7.2 | `AdminLessonController` — CRUD Lesson | ✅ | `/api/admin/lessons?courseId=` |
| 7.3 | `AdminExerciseController` — CRUD Exercise | ✅ | `/api/admin/exercises?lessonId=`, trả về `correctAnswer` |
| 7.4 | `AdminVocabController` — CRUD Vocabulary | ✅ | `/api/admin/vocab?level=&topic=` |
| 7.5 | `AdminContentService` | ✅ | Cascade delete an toàn (attempts→progress→exercises→lesson→course) |
| 7.6 | DTOs: `UpsertCourseRequest`, `UpsertLessonRequest`, `UpsertExerciseRequest`, `UpsertVocabRequest`, `AdminExerciseDto` | ✅ | Validation CEFR pattern, type-specific exercise rules |
| 7.7 | Phân loại từ vựng theo trình độ CEFR (A1–C2) bởi Admin | ✅ | `PUT /api/admin/vocab/{id}` với field `difficultyLevel` |

---

## Module 8 — Analytics / Event Logging

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 8.1 | `EventLog` entity + `EventType` enum | ✅ | Package `anylytics/` (giữ typo), metadata JSONB |
| 8.2 | `EventLogRepository` (filter by userId, eventType; stats queries) | ✅ | |
| 8.3 | `EventLogService` (async log + listEvents + getStats) | ✅ | `@Async` — fire-and-forget, không block request |
| 8.4 | `EventLogController` — `POST /api/events/log` | ✅ | Client-side manual logging |
| 8.5 | `AdminEventController` — `GET /api/admin/events`, `GET /api/admin/events/stats` | ✅ | |
| 8.6 | AOP Aspect `LessonEventAspect` — tự động log `START_LESSON` | ✅ | `@AfterReturning` trên `LessonService.getById()`, lấy user từ `SecurityContextHolder` |
| 8.7 | Tích hợp vào `ExerciseGradingService` | ✅ | Log `ANSWER_CORRECT`, `ANSWER_WRONG`, `FINISH_LESSON` tự động |
| 8.8 | DTOs: `LogEventRequest`, `EventLogDto`, `EventStatsDto` | ✅ | |

---

## Module 9 — Notification

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 9.1 | Push notification nhắc nhở học theo giờ cố định | ❌ | |
| 9.2 | Push notification khi sắp đứt Streak | ❌ | |

---

## Module 10 — Flutter Frontend

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 10.1 | Toàn bộ Flutter frontend | ❌ | Chưa bắt đầu |

---

## Giai đoạn tương lai — AI Integration

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| AI.1 | Upload URL / PDF, AI trích xuất từ vựng quan trọng | ❌ | Roadmap — sau khi core hoàn chỉnh |
| AI.2 | Tạo Flashcard cá nhân hóa theo trình độ người dùng | ❌ | |

---

## Thứ tự ưu tiên đề xuất

1. **Module 4** — Hoàn thiện Content entities + API (Course → Lesson → Exercise)
2. **Module 5** — Progress & Submission (submit bài, tính XP, streak)
3. **Module 7** — Admin CMS cho content
4. **Module 6** — Vocabulary tools
5. **Module 8** — Analytics / Event logging (dùng AOP)
6. **Module 9** — Notification
7. **Module 10** — Flutter frontend
