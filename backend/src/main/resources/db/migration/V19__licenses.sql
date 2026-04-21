-- Выданные лицензии в сфере обращения с отходами
-- Запись создаётся только при статусе APPROVED заявки (license_applications).
-- Номер лицензии: ЛП-{YYYY}-{NNNN} — сквозная нумерация по году.

CREATE TABLE licenses (
    id                      BIGSERIAL PRIMARY KEY,
    license_number          VARCHAR(20)  NOT NULL UNIQUE, -- ЛП-2026-0001
    application_id          BIGINT       NOT NULL UNIQUE REFERENCES license_applications(id),

    -- дублируем ключевые поля заявителя для устойчивости
    applicant_type          VARCHAR(20)  NOT NULL,
    applicant_id            BIGINT,
    applicant_name          VARCHAR(255) NOT NULL,
    applicant_inn           VARCHAR(14)  NOT NULL,

    license_type            VARCHAR(20)  NOT NULL,
    activity_types          TEXT[]       NOT NULL,
    legal_address           TEXT         NOT NULL,
    actual_address          TEXT         NOT NULL,

    -- срок
    issued_at               DATE         NOT NULL,
    valid_until             DATE         NOT NULL, -- обязательно, бессрочных не бывает

    -- публикация и отзыв
    is_published            BOOLEAN      NOT NULL DEFAULT TRUE,
    is_revoked              BOOLEAN      NOT NULL DEFAULT FALSE,
    revoked_at              TIMESTAMP,
    revocation_reason       TEXT,

    issued_by_id            BIGINT REFERENCES users(id),

    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lic_number     ON licenses (license_number);
CREATE INDEX idx_lic_inn        ON licenses (applicant_inn);
CREATE INDEX idx_lic_type       ON licenses (license_type);
CREATE INDEX idx_lic_published  ON licenses (is_published) WHERE is_revoked = FALSE;
CREATE INDEX idx_lic_valid      ON licenses (valid_until) WHERE is_revoked = FALSE;


-- ─── SEQUENCE ДЛЯ ГЕНЕРАЦИИ НОМЕРА ЛИЦЕНЗИИ ───
-- Одна таблица-счётчик на год.
-- Реализация в сервисе: внутри транзакции approve() делаем
--   INSERT INTO license_number_counters (year, counter)
--     VALUES (EXTRACT(YEAR FROM NOW())::INT, 1)
--     ON CONFLICT (year) DO UPDATE SET counter = license_number_counters.counter + 1
--     RETURNING counter;
-- и форматируем: ЛП-{year}-{LPAD(counter, 4, '0')}
CREATE TABLE license_number_counters (
    year        INTEGER PRIMARY KEY,
    counter     INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
