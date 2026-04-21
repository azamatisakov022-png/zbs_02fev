-- Платежи госпошлины по заявкам на лицензию
-- Провайдер-агностичная модель: конкретная платёжная система подключается
-- через интерфейс PaymentProvider. До выбора провайдера используется MOCK.
--
-- Правила:
--   - Один LicenseApplication = максимум один успешный Payment (одна квитанция на заявку).
--   - При переоткрытии заявки после отказа payment НЕ пересоздаётся.
--   - Срок давности квитанции не ограничен (действительна до выдачи лицензии).
--   - Возврат через АИС не реализуется (письменное обращение в МПРЭТН вне системы).

CREATE TABLE payments (
    id                      BIGSERIAL PRIMARY KEY,
    application_id          BIGINT        NOT NULL REFERENCES license_applications(id) ON DELETE CASCADE,

    provider                VARCHAR(30)   NOT NULL,  -- ELDIK|GNS|AGGREGATOR|MANUAL|MOCK
    provider_order_id       VARCHAR(100),            -- ID заказа у провайдера (nullable для MANUAL)
    amount                  NUMERIC(12,2) NOT NULL,
    currency                VARCHAR(3)    NOT NULL DEFAULT 'KGS',

    status                  VARCHAR(20)   NOT NULL,  -- PENDING|SUCCESS|FAILED|EXPIRED|MANUAL_CONFIRMED
    payment_method          VARCHAR(20),             -- CARD|QR|BANK_TRANSFER|MANUAL_OFFLINE
    paid_at                 TIMESTAMP,
    expires_at              TIMESTAMP,               -- для PENDING — обычно +24 часа

    -- ссылка на квитанцию
    receipt_url             TEXT,                    -- от провайдера (онлайн)
    manual_receipt_object_key VARCHAR(255),          -- загруженная заявителем (офлайн)
    manual_receipt_file_name  VARCHAR(255),

    -- ручное подтверждение (для MANUAL_OFFLINE)
    manual_confirmed_by_id  BIGINT REFERENCES users(id),
    manual_confirmed_at     TIMESTAMP,

    -- произвольные данные от провайдера (для отладки/аудита)
    metadata                JSONB,

    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Одна заявка = максимум один НЕотменённый платёж (успешный или ожидающий).
-- Частичный уникальный индекс: failed/expired платежи можно создавать повторно.
CREATE UNIQUE INDEX idx_pay_app_active
    ON payments (application_id)
    WHERE status IN ('PENDING', 'SUCCESS', 'MANUAL_CONFIRMED');

CREATE INDEX idx_pay_app      ON payments (application_id);
CREATE INDEX idx_pay_status   ON payments (status);
CREATE INDEX idx_pay_order    ON payments (provider, provider_order_id);


-- ─── ЛОГ СОБЫТИЙ ПЛАТЕЖЕЙ ───
-- Для аудита webhook'ов от провайдеров (включая невалидные/неопознанные).
-- Помогает разбирать инциденты и защищаться от подделки webhook'ов.
CREATE TABLE payment_events (
    id                  BIGSERIAL PRIMARY KEY,
    payment_id          BIGINT REFERENCES payments(id),
    provider            VARCHAR(30)  NOT NULL,
    event_type          VARCHAR(50)  NOT NULL,  -- payment.success, payment.failed, ...
    raw_payload         JSONB        NOT NULL,  -- сырой body от провайдера
    signature           TEXT,                   -- подпись из заголовка
    is_signature_valid  BOOLEAN,
    processing_error    TEXT,                   -- если обработка упала
    received_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pe_payment  ON payment_events (payment_id);
CREATE INDEX idx_pe_provider ON payment_events (provider);
CREATE INDEX idx_pe_received ON payment_events (received_at);


-- ─── НАСТРОЙКИ ПЛАТЕЖНОГО МОДУЛЯ ───
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('payment_provider_active', 'MOCK', 'Активный платёжный провайдер (MOCK|ELDIK|GNS|AGGREGATOR)')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('payment_pending_timeout_hours', '24', 'Таймаут ожидания онлайн-оплаты (часы). По истечении заявка возвращается в DRAFT.')
ON CONFLICT (setting_key) DO NOTHING;
