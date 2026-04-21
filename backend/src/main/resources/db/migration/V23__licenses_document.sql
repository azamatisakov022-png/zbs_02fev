-- Электронная копия подписанной лицензии (отсканированный бланк).
-- После одобрения заявки сотрудник МПРЭТН печатает официальный бланк,
-- подписывает его у замминистра, ставит печать, сканирует и загружает
-- PDF в АИС. Заявитель после этого может скачать свою лицензию в ЛК,
-- а в публичном реестре появляется ссылка для проверки подлинности.
--
-- Файл хранится в MinIO по object_key (как license_application_documents).

ALTER TABLE licenses
    ADD COLUMN license_document_object_key VARCHAR(255),
    ADD COLUMN license_document_file_name  VARCHAR(255),
    ADD COLUMN license_document_uploaded_at TIMESTAMP,
    ADD COLUMN license_document_uploaded_by_id BIGINT REFERENCES users(id);

COMMENT ON COLUMN licenses.license_document_object_key IS
    'S3/MinIO ключ PDF-скана подписанной лицензии. NULL до загрузки сотрудником.';
