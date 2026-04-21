-- Заявки на выдачу лицензий в сфере обращения с отходами
-- Согласовано: письмо МПРЭТН КР № 16-819/Сл от 15.04.2026
-- Правовая база: Закон КР № 195 от 19.10.2023 (ст. 14), Постановление КМ КР № 678 (гл. 64)

-- ─── ЗАЯВКИ НА ЛИЦЕНЗИЮ ───
CREATE TABLE license_applications (
    id                      BIGSERIAL PRIMARY KEY,

    -- заявитель (полиморфная связь, FK проверяется на уровне сервиса)
    applicant_type          VARCHAR(20)  NOT NULL, -- RECYCLER|LANDFILL|COLLECTION_POINT|OTHER
    applicant_id            BIGINT,                -- nullable для OTHER
    applicant_entity        VARCHAR(20)  NOT NULL, -- LEGAL_ENTITY|SOLE_PROPRIETOR
    applicant_name          VARCHAR(255) NOT NULL, -- денормализация для устойчивости
    applicant_inn           VARCHAR(14)  NOT NULL,

    -- параметры лицензии
    license_type            VARCHAR(20)  NOT NULL, -- COLLECTION|TRANSPORTATION|PROCESSING|NEUTRALIZATION|STORAGE_DISPOSAL|COMPLEX
    activity_types          TEXT[]       NOT NULL, -- виды деятельности, можно несколько
    legal_address           TEXT         NOT NULL,
    actual_address          TEXT         NOT NULL,
    contact_phone           VARCHAR(30),
    contact_email           VARCHAR(100),
    contact_person          VARCHAR(100),

    -- процесс
    status                  VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
                                                   -- DRAFT|PAYMENT_PENDING|SUBMITTED|UNDER_REVIEW|
                                                   -- SITE_VISIT_DONE|APPROVED|REJECTED
    submitted_at            TIMESTAMP,
    deadline                TIMESTAMP,             -- submitted_at + 30 календарных дней
    reopened_count          INTEGER      NOT NULL DEFAULT 0, -- сколько раз заявка переоткрывалась

    -- выезд на объект (обязателен для всех видов лицензий)
    site_visit_done         BOOLEAN      NOT NULL DEFAULT FALSE,
    site_visit_date         DATE,
    site_visit_inspector    VARCHAR(200),          -- ФИО инспектора/секретаря комиссии (текст, не FK)
    site_visit_comment      TEXT,

    -- отказ (закрытый перечень по ст. 14 Закона № 195)
    rejection_reason        VARCHAR(30),           -- LEGAL_PROHIBITION|COURT_DECISION|INVALID_INFO|
                                                   -- DOCUMENTS_MISMATCH|FEE_NOT_PAID
    rejection_comment       TEXT,                  -- опциональное уточнение
    rejection_decision_by_id BIGINT REFERENCES users(id),
    rejection_decision_at   TIMESTAMP,

    -- кем подана
    submitted_by_id         BIGINT REFERENCES users(id),

    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_la_status      ON license_applications (status);
CREATE INDEX idx_la_applicant   ON license_applications (applicant_type, applicant_id);
CREATE INDEX idx_la_submitter   ON license_applications (submitted_by_id);
CREATE INDEX idx_la_inn         ON license_applications (applicant_inn);
CREATE INDEX idx_la_deadline    ON license_applications (deadline)
    WHERE status IN ('SUBMITTED', 'UNDER_REVIEW', 'SITE_VISIT_DONE');


-- ─── ДОКУМЕНТЫ ЗАЯВКИ ───
-- Базовые (для всех): APPLICATION_FORM, REGISTRATION_CERT, PAYMENT_RECEIPT
-- Расширенные (для PROCESSING/NEUTRALIZATION/STORAGE_DISPOSAL/COMPLEX — п. 396):
--   WASTE_OBJECT_OWNERSHIP, ECO_EXPERTISE_REPORT, ECO_JUSTIFICATION, SECURITY_ORDER,
--   SANITARY_FIRE_APPROVAL, QUALITY_CONTROL_INFO, MEASURING_EQUIPMENT_LIST,
--   METROLOGY_CERTIFICATES, PERSONNEL_INFO
CREATE TABLE license_application_documents (
    id                  BIGSERIAL PRIMARY KEY,
    application_id      BIGINT       NOT NULL REFERENCES license_applications(id) ON DELETE CASCADE,
    doc_type            VARCHAR(40)  NOT NULL,
    file_object_key     VARCHAR(255) NOT NULL,     -- ключ в S3/MinIO, аналогично contest_applications.document_object_key
    file_name           VARCHAR(255) NOT NULL,
    file_size           BIGINT,
    uploaded_by_id      BIGINT REFERENCES users(id),
    uploaded_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lad_app  ON license_application_documents (application_id);
CREATE INDEX idx_lad_type ON license_application_documents (application_id, doc_type);


-- ─── РЕВИЗИИ ЗАЯВКИ (для аудита при переоткрытии) ───
-- При повторной подаче (после устранимого отказа) сохраняется снимок данных заявки
-- на момент каждой отправки — для прозрачности и разбора претензий.
CREATE TABLE license_application_revisions (
    id                  BIGSERIAL PRIMARY KEY,
    application_id      BIGINT    NOT NULL REFERENCES license_applications(id) ON DELETE CASCADE,
    revision_number     INTEGER   NOT NULL,        -- 1, 2, 3... по порядку подач
    snapshot            JSONB     NOT NULL,        -- полный снимок полей заявки + документов
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_lar_app_rev ON license_application_revisions (application_id, revision_number);


-- ─── РАЗМЕР ГОСПОШЛИНЫ ───
-- Размер хранится в system_settings (таблица из миграции V11), чтобы менять без деплоя.
-- Используется ключ 'license_fee_kgs'. Начальное значение задаст сотрудник через админку.
-- Для удобства первого запуска seed'им дефолт 1000 сом (уточнить актуальное значение).
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('license_fee_kgs', '1000', 'Размер госпошлины за лицензию (сом)')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('license_review_deadline_days', '30', 'Нормативный срок рассмотрения заявки (календарные дни), ст. 14 Закона № 195')
ON CONFLICT (setting_key) DO NOTHING;
