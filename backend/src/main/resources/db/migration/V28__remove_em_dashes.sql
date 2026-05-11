-- V28: Замена длинного тире (—) на обычный дефис (-) в существующих записях.
-- Контекст: текст с em-dash в шаблонах ИИ-генерации выглядит палевно.
-- Затронуты только таблицы с пользовательским текстом, которые seed-ились ранее:
--   * publications        — заголовки, превью, тело статей
--   * faq                 — вопрос/ответ
--   * license_applications — комментарий к отказу

UPDATE publications SET
    title_ru   = REPLACE(title_ru,   '—', '-'),
    title_ky   = REPLACE(title_ky,   '—', '-'),
    title_en   = REPLACE(title_en,   '—', '-'),
    excerpt_ru = REPLACE(excerpt_ru, '—', '-'),
    excerpt_ky = REPLACE(excerpt_ky, '—', '-'),
    excerpt_en = REPLACE(excerpt_en, '—', '-'),
    body_ru    = REPLACE(body_ru,    '—', '-'),
    body_ky    = REPLACE(body_ky,    '—', '-'),
    body_en    = REPLACE(body_en,    '—', '-')
WHERE title_ru   LIKE '%—%' OR title_ky   LIKE '%—%' OR title_en   LIKE '%—%'
   OR excerpt_ru LIKE '%—%' OR excerpt_ky LIKE '%—%' OR excerpt_en LIKE '%—%'
   OR body_ru    LIKE '%—%' OR body_ky    LIKE '%—%' OR body_en    LIKE '%—%';

UPDATE faq SET
    question = REPLACE(question, '—', '-'),
    answer   = REPLACE(answer,   '—', '-')
WHERE question LIKE '%—%' OR answer LIKE '%—%';

UPDATE license_applications SET
    rejection_comment = REPLACE(rejection_comment, '—', '-')
WHERE rejection_comment LIKE '%—%';
