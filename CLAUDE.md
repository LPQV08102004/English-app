# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack English language learning application with a Spring Boot backend and Flutter mobile frontend. Currently in early-stage development — the core framework is in place but most feature modules are stubs.

## Backend Commands

All Maven commands run from `backend/backend/`:

```bash
# Run the application
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build jar (skip tests)
./mvnw clean package -DskipTests

# Full build with tests
./mvnw clean package
```

**Prerequisites:** PostgreSQL must be running on `localhost:5432` with database `english_db`, user `myuser`.

Swagger UI is available at `http://localhost:8080/swagger-ui.html` when the app is running.

## Architecture

### Backend Structure (`backend/backend/src/main/java/com/englishapp/backend/`)

The backend follows a package-by-feature pattern:

- **`common/`** — Shared utilities: `ApiResponse<T>` (generic response wrapper), `ApiError`, `GlobalExceptionHandler` (maps `NotFoundException`→404, `BadRequestException`→400, `ValidationException`→422)
- **`config/`** — Framework config: `SecurityConfig` (CSRF disabled, all requests permitted — dev only), `CorsConfig` (wildcard CORS), `OpenApiConfig`, `JacksonConfig`
- **`content/`** — Course/Lesson/Exercise entities (partially implemented — `Course` entity exists, `Lesson` and `Exercise` are stubs)
- **`auth/`, `admin/`, `progress/`, `vocab/`, `anylytics/`** — Feature modules that are currently empty stubs

When adding a new feature module, follow the pattern: Entity → Repository → Service → Controller → DTOs (request/response).

### Planned Data Model

Key entities per `docs/business-context`:
- `User` (email, password, xp, level, streak)
- `Course` → `Lesson` → `Exercise` (CEFR levels A1–C2)
- `LessonProgress`, `ExerciseAttempt` (user activity)
- `VocabSaved`, `VocabMistakes` (vocabulary tracking)
- `EventLog` (analytics)

### Planned API Structure

```
POST /api/auth/login|register
GET  /api/me
GET  /api/courses, /api/courses/{id}/lessons
GET  /api/lessons/{id}/exercises
POST /api/progress/lessons/{id}/submit
GET  /api/vocab/dictionary, /api/vocab/mistakes
POST /api/vocab/save
POST /api/events/log
POST /api/admin/courses|lessons|exercises (CRUD)
```

### Data Files

`vocabulary_school.json` and related NDJSON files contain vocabulary datasets. Python scripts in the project root handle conversion from the large `kaikki.org-dictionary-English` JSONL source (2.8GB) to CSV/NDJSON formats:
- `convert_to_csv.py` — JSONL → CSV with flattened nested structures
- `check_csv.py` — validates CSV structure and column counts
- `json_to_ndjson.py` — format conversion

### React Frontend

Located in the project root alongside the backend. Uses Dio HTTP client with JWT interceptors. Feature-based structure mirroring the backend modules (auth, courses, lessons, quiz, progress, vocab, notifications, analytics). Not yet implemented.

## Key Configuration

`application.properties` settings to be aware of:
- `spring.jpa.hibernate.ddl-auto=update` — Hibernate auto-creates/updates tables from entities
- `spring.jpa.show-sql=true` — SQL queries logged to console
- Security is fully open (no auth enforced) — this must be locked down before production

## Typo in Codebase

The analytics module directory is named `anylytics/` (typo) — maintain this spelling when referencing it to avoid breaking imports.

This file should be updated as development progresses and more features are implemented. It serves as a living document to guide Claude Code in understanding the current state and structure of the codebase.

## Workflow
When working to a new feature, follow this workflow:
1. Always plan what you need to do, and mark off completed plans in a separate plan file within this project.
2. 
