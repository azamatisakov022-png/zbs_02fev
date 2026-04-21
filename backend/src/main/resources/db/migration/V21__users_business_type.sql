-- Тип бизнес-пользователя (только для role=BUSINESS):
--   PAYER     — плательщик утильсбора (импортёр/производитель), существующее поведение
--   APPLICANT — заявитель на лицензию (переработчик, полигон, пункт приёма, иной субъект)
--   BOTH      — редкий случай: одновременно платит утильсбор и получает лицензию
--
-- Для ECO_OPERATOR / MINISTRY / EMPLOYEE / ADMIN — поле игнорируется.
-- В ЛК BUSINESS определяет, какие разделы меню показывать.

ALTER TABLE users
    ADD COLUMN business_type VARCHAR(10) NOT NULL DEFAULT 'PAYER';

CREATE INDEX idx_users_business_type ON users (business_type) WHERE role = 'BUSINESS';

-- Все существующие BUSINESS-пользователи становятся PAYER — это штатное поведение.
-- Апдейтим через дефолт, уже отработало при ADD COLUMN.

COMMENT ON COLUMN users.business_type IS
    'Тип бизнес-пользователя: PAYER|APPLICANT|BOTH. Используется для роутинга меню в ЛК.';
