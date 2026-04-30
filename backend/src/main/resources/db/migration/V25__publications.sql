-- Раздел «Публикации» — новостной модуль АИС.
--
-- Контекст:
--   - 4 категории: news (новости/объявления), contest (конкурсы),
--     report_analytics (отчёты/аналитика), press (пресс-релизы).
--   - Категория «Законодательство» НЕ включена — она дублирует раздел
--     «Нормативная база», доступный отдельно.
--   - 2 организации-автора: MPRETN и ECO_OPERATOR. Права редактирования
--     контролируются на уровне сервиса (ECO_OPERATOR не может редактировать
--     записи МПРЭТН и наоборот). Админ редактирует всё.
--   - Мультиязычность: RU обязательный, KY/EN опциональные с fallback на RU.
--   - Cover обязательный (хранится в MinIO).
--   - Без модерации: автор публикует сразу. Снять с публикации можно
--     через is_published = false.

CREATE TABLE publications (
    id                       BIGSERIAL PRIMARY KEY,
    slug                     VARCHAR(255) NOT NULL UNIQUE,
    category                 VARCHAR(20)  NOT NULL,
        -- news | contest | report_analytics | press
    author_org               VARCHAR(20)  NOT NULL,
        -- MPRETN | ECO_OPERATOR | ADMIN_GENERIC
    cover_url                VARCHAR(500) NOT NULL,

    -- Многоязычные поля (RU обязательный)
    title_ru                 VARCHAR(500) NOT NULL,
    title_ky                 VARCHAR(500),
    title_en                 VARCHAR(500),
    excerpt_ru               TEXT         NOT NULL,
    excerpt_ky               TEXT,
    excerpt_en               TEXT,
    body_ru                  TEXT         NOT NULL,
    body_ky                  TEXT,
    body_en                  TEXT,

    read_minutes             INTEGER      NOT NULL DEFAULT 1,

    -- Метаданные публикации
    is_published             BOOLEAN      NOT NULL DEFAULT TRUE,
    published_at             TIMESTAMP    NOT NULL DEFAULT NOW(),
    unpublished_at           TIMESTAMP,
    unpublished_by_id        BIGINT REFERENCES users(id),

    -- Audit trail
    created_by_id            BIGINT REFERENCES users(id),
    last_edited_by_id        BIGINT REFERENCES users(id),
    last_edited_at           TIMESTAMP,
    view_count               INTEGER      NOT NULL DEFAULT 0,

    created_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Индексы для типовых запросов
CREATE INDEX idx_pub_published    ON publications (is_published, published_at DESC);
CREATE INDEX idx_pub_category     ON publications (category, is_published, published_at DESC);
CREATE INDEX idx_pub_author       ON publications (author_org, is_published, published_at DESC);
CREATE INDEX idx_pub_slug         ON publications (slug);

-- Полнотекстовый индекс по русскому тексту (для server-side поиска
-- если данных будет много)
CREATE INDEX idx_pub_search_ru ON publications
    USING GIN (to_tsvector('russian', coalesce(title_ru, '') || ' ' || coalesce(excerpt_ru, '')));
