-- ============================================================
-- English Learning App — Reference Schema
-- Nguồn gốc: khớp với Java entities (Hibernate ddl-auto=update
-- sẽ tự sinh các bảng này từ entity khi khởi động lần đầu).
-- Dùng file này để tham khảo hoặc khởi tạo DB thủ công.
-- ============================================================

-- Bật extension uuid nếu chưa có
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Drop (nếu reset lại từ đầu)
-- ============================================================
DROP TABLE IF EXISTS exercise_attempts    CASCADE;
DROP TABLE IF EXISTS event_logs           CASCADE;
DROP TABLE IF EXISTS vocab_saved          CASCADE;
DROP TABLE IF EXISTS user_mistakes        CASCADE;
DROP TABLE IF EXISTS user_lesson_progress CASCADE;
DROP TABLE IF EXISTS exercises            CASCADE;
DROP TABLE IF EXISTS vocabularies         CASCADE;
DROP TABLE IF EXISTS lessons              CASCADE;
DROP TABLE IF EXISTS courses              CASCADE;
DROP TABLE IF EXISTS users                CASCADE;
DROP TYPE  IF EXISTS event_type_enum;

-- ============================================================
-- 1. users  (khớp với entity User.java)
-- ============================================================
CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) UNIQUE NOT NULL,
    password       VARCHAR(255) NOT NULL,
    display_name   VARCHAR(255),
    avatar_url     VARCHAR(255),
    xp             INT         NOT NULL DEFAULT 0,
    streak_days    INT         NOT NULL DEFAULT 0,
    last_studied_at DATE,
    -- Giá trị: 'ROLE_USER' hoặc 'ROLE_ADMIN' (khớp với enum Role.java)
    role           VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    active         BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. courses  (khớp với entity Course.java)
-- ============================================================
CREATE TABLE courses (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    level_target VARCHAR(10)  NOT NULL  -- A1, A2, B1, B2, C1, C2
);

-- ============================================================
-- 3. lessons  (entity Lesson.java — chưa implement, tạo sẵn)
-- ============================================================
CREATE TABLE lessons (
    id          BIGSERIAL PRIMARY KEY,
    course_id   BIGINT      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    order_index INT         NOT NULL DEFAULT 1
);

-- ============================================================
-- 4. vocabularies  (entity chưa có trong Java — tạo sẵn theo plan)
-- ============================================================
CREATE TABLE vocabularies (
    id              BIGSERIAL PRIMARY KEY,
    lesson_id       BIGINT       REFERENCES lessons(id) ON DELETE SET NULL,
    word            VARCHAR(100) NOT NULL,
    meaning         VARCHAR(255) NOT NULL,
    ipa             VARCHAR(100),
    part_of_speech  VARCHAR(20),           -- n, v, adj, adv ...
    audio_url       VARCHAR(255),
    example         TEXT,
    difficulty_level VARCHAR(10),          -- A1, A2, B1 ...
    grammar_info    JSONB                  -- { "v1": "...", "plural": "..." }
);

-- ============================================================
-- 5. exercises  (entity Exercise.java — chưa implement, tạo sẵn)
-- ============================================================
CREATE TABLE exercises (
    id             BIGSERIAL PRIMARY KEY,
    lesson_id      BIGINT       NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question       TEXT         NOT NULL,
    -- Giá trị: MULTIPLE_CHOICE | FILL_IN_THE_BLANK
    type           VARCHAR(50)  NOT NULL,
    options        JSONB,                  -- ["Answer A", "Answer B", ...]
    correct_answer VARCHAR(255) NOT NULL
);

-- ============================================================
-- 6. user_lesson_progress  (entity chưa có trong Java)
-- ============================================================
CREATE TABLE user_lesson_progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      UUID    NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    lesson_id    BIGINT  NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    score        INT     NOT NULL DEFAULT 0,
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, lesson_id)
);

-- ============================================================
-- 7. user_mistakes  (entity chưa có trong Java — VocabMistakes)
-- ============================================================
CREATE TABLE user_mistakes (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID   NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    vocabulary_id   BIGINT NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    mistake_count   INT    NOT NULL DEFAULT 1,
    last_reviewed_at TIMESTAMP,
    UNIQUE (user_id, vocabulary_id)
);

-- ============================================================
-- 8. vocab_saved  (entity chưa có trong Java)
-- ============================================================
CREATE TABLE vocab_saved (
    id         BIGSERIAL PRIMARY KEY,
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word       VARCHAR(200) NOT NULL,
    meaning    TEXT,
    note       TEXT,
    -- manual | dictionary | translate
    source     VARCHAR(50)  NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, word)
);
CREATE INDEX idx_vocab_saved_user ON vocab_saved(user_id);

-- ============================================================
-- 9. event_logs  (entity EventLog — module anylytics/)
-- ============================================================
CREATE TYPE event_type_enum AS ENUM (
    'START_LESSON',
    'FINISH_LESSON',
    'ANSWER_CORRECT',
    'ANSWER_WRONG'
);

CREATE TABLE event_logs (
    id         BIGSERIAL        PRIMARY KEY,
    user_id    UUID             REFERENCES users(id) ON DELETE SET NULL,
    event_type event_type_enum  NOT NULL,
    metadata   JSONB,
    created_at TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_event_logs_user ON event_logs(user_id);

-- ============================================================
-- 10. exercise_attempts  (entity chưa có trong Java)
-- ============================================================
CREATE TABLE exercise_attempts (
    id               BIGSERIAL   PRIMARY KEY,
    user_id          UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    lesson_id        BIGINT      NOT NULL REFERENCES lessons(id)  ON DELETE CASCADE,
    exercise_item_id BIGINT      NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    user_answer      TEXT        NOT NULL,
    is_correct       BOOLEAN     NOT NULL,
    attempted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_exercise_attempts_user ON exercise_attempts(user_id);
