-- Подтип заявителя на лицензию (только для users с business_type IN ('APPLICANT','BOTH')).
-- Допустимые значения совпадают со значениями enum kg.eco.operator.entity.enums.ApplicantType:
--   RECYCLER         — переработчик отходов
--   LANDFILL         — полигон ТБО
--   COLLECTION_POINT — пункт приёма
--   OTHER            — иная организация в сфере обращения с отходами
--
-- Для PAYER-пользователей и не-BUSINESS ролей поле NULL.
-- Заполняется при регистрации (если пользователь выбрал «Заявитель на лицензию»)
-- и может быть изменено самим пользователем в настройках профиля.
--
-- Цель: предзаполнять тип субъекта при подаче первой заявки на лицензию,
-- избавляя пользователя от повторного выбора в форме заявки.

ALTER TABLE users
    ADD COLUMN applicant_type VARCHAR(32);

-- Частичный индекс — нужен только для BUSINESS-пользователей со значением.
-- Не платим за индекс на массе NULL-строк (плательщиков и сотрудников).
CREATE INDEX idx_users_applicant_type
    ON users (applicant_type)
    WHERE applicant_type IS NOT NULL;

COMMENT ON COLUMN users.applicant_type IS
    'Подтип заявителя на лицензию: RECYCLER|LANDFILL|COLLECTION_POINT|OTHER. '
    'NULL для PAYER-пользователей и не-BUSINESS ролей.';
