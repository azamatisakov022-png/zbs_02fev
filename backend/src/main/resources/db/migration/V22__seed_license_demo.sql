-- Демо-данные модуля «Лицензии» для показа заказчику.
-- Создаёт:
--   1 APPLICANT-пользователя ("Чистый Мир") с ролью BUSINESS
--   6 заявок в разных статусах для покрытия всех сценариев демо
--   2 выданные лицензии с реальными номерами ЛП-2026-0001/0002
--   Платежи в разных состояниях

-- ─── Компания и пользователь-заявитель ───
-- ИНН 20000000000001 - тестовый заявитель «Чистый Мир»
INSERT INTO companies (id, company_name, inn, legal_form, region, address, director, contact_person, phone, email)
VALUES (100, 'ОсОО «Чистый Мир»', '20000000000001', 'ОсОО', 'Бишкек',
        'г. Бишкек, ул. Токтогула, 154', 'Асанов Б.А.', 'Асанов Б.А.',
        '+996 555 100100', 'info@cleanworld.kg')
ON CONFLICT (inn) DO NOTHING;

-- Пароль: test123 (тот же BCrypt-хэш, что у существующих тестовых пользователей)
INSERT INTO users (id, inn, password, company_name, role, business_type, email, phone, company_id, created_at)
VALUES (100, '20000000000001',
        '$2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS',
        'ОсОО «Чистый Мир»', 'BUSINESS', 'APPLICANT',
        'info@cleanworld.kg', '+996 555 100100', 100, NOW())
ON CONFLICT (inn) DO NOTHING;

-- ─── Заявки ───

-- #1: DRAFT - черновик, заявитель ещё не отправил
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_by_id,
    created_at, updated_at
) VALUES (
    1001, 'RECYCLER', 'LEGAL_ENTITY', 'ОсОО «Чистый Мир»', '20000000000001',
    'PROCESSING', ARRAY['Переработка пластика','Сортировка ТБО'],
    'г. Бишкек, ул. Токтогула, 154', 'г. Бишкек, Западный промузел, 8',
    '+996 555 100100', 'info@cleanworld.kg', 'Асанов Б.А.',
    'DRAFT', 100, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- #2: SUBMITTED - подана, ожидает рассмотрения, онлайн-оплата успешна
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_at, deadline,
    submitted_by_id, created_at, updated_at
) VALUES (
    1002, 'RECYCLER', 'LEGAL_ENTITY', 'ОсОО «ВторСтекло»', '02345600000123',
    'COLLECTION', ARRAY['Сбор стеклянной тары'],
    'г. Бишкек, ул. Ибраимова, 45', 'г. Бишкек, ул. Ибраимова, 45',
    '+996 555 222333', 'office@vtorsteklo.kg', 'Петров И.С.',
    'SUBMITTED', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days',
    100, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO license_payments (id, application_id, provider, provider_order_id, amount, currency, status, payment_method, paid_at, created_at, updated_at)
VALUES (2001, 1002, 'MOCK', 'MOCK-DEMO-001', 1000, 'KGS', 'SUCCESS', 'CARD',
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- #3: UNDER_REVIEW - принята к рассмотрению, ждёт выезда
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_at, deadline,
    submitted_by_id, created_at, updated_at
) VALUES (
    1003, 'LANDFILL', 'LEGAL_ENTITY', 'ОсОО «Тазалык-Восток»', '02111122223344',
    'STORAGE_DISPOSAL', ARRAY['Захоронение ТБО'],
    'Чуйская обл., Аламудунский район, с. Ленинское',
    'Чуйская обл., Аламудунский район, полигон №4',
    '+996 312 440505', 'office@taza-vostok.kg', 'Керимов К.М.',
    'UNDER_REVIEW', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days',
    100, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO license_payments (id, application_id, provider, amount, currency, status, payment_method, paid_at, manual_receipt_file_name, manual_confirmed_by_id, manual_confirmed_at, created_at, updated_at)
VALUES (2002, 1003, 'MANUAL', 1000, 'KGS', 'MANUAL_CONFIRMED', 'MANUAL_OFFLINE',
        NOW() - INTERVAL '12 days', 'kvitancia-eldik-154234.pdf', 1,
        NOW() - INTERVAL '9 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- #4: REJECTED (устранимый отказ) - для демо сценария «Доработать»
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_at, deadline,
    rejection_reason, rejection_comment, rejection_decision_at,
    submitted_by_id, created_at, updated_at
) VALUES (
    1004, 'COLLECTION_POINT', 'SOLE_PROPRIETOR', 'ИП Бекмаматов А.С.', '21800199012345',
    'COLLECTION', ARRAY['Пункт приёма макулатуры'],
    'г. Ош, ул. Масалиева, 18', 'г. Ош, ул. Масалиева, 18',
    '+996 555 776699', NULL, 'Бекмаматов А.С.',
    'REJECTED', NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days',
    'DOCUMENTS_MISMATCH', 'Свидетельство о регистрации неактуально - срок продления истёк. Обновите и подайте повторно.',
    NOW() - INTERVAL '2 days', 100, NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO license_payments (id, application_id, provider, provider_order_id, amount, currency, status, payment_method, paid_at, created_at, updated_at)
VALUES (2003, 1004, 'MOCK', 'MOCK-DEMO-003', 1000, 'KGS', 'SUCCESS', 'CARD',
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- #5: SITE_VISIT_DONE - выезд проведён, ждёт финального решения
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_at, deadline,
    site_visit_done, site_visit_date, site_visit_inspector, site_visit_comment,
    submitted_by_id, created_at, updated_at
) VALUES (
    1005, 'RECYCLER', 'LEGAL_ENTITY', 'ОсОО «ЭкоПласт»', '02567888801011',
    'PROCESSING', ARRAY['Переработка ПЭТ','Гранулирование'],
    'г. Бишкек, Южные ворота, 12', 'г. Бишкек, Южные ворота, 12, цех №2',
    '+996 555 334455', 'info@ecoplast.kg', 'Жумалиева А.К.',
    'SITE_VISIT_DONE', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days',
    TRUE, CURRENT_DATE - INTERVAL '3 days', 'Ибраев М.К., инспектор МПРЭТН',
    'Производственные мощности соответствуют заявленным. Оборудование прошло метрологическую аттестацию. Замечаний нет.',
    100, NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO license_payments (id, application_id, provider, provider_order_id, amount, currency, status, payment_method, paid_at, created_at, updated_at)
VALUES (2005, 1005, 'MOCK', 'MOCK-DEMO-005', 1000, 'KGS', 'SUCCESS', 'CARD',
        NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- #6: APPROVED - уже выдана лицензия, первая в году
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_at, deadline,
    site_visit_done, site_visit_date, site_visit_inspector, site_visit_comment,
    submitted_by_id, created_at, updated_at
) VALUES (
    1006, 'RECYCLER', 'LEGAL_ENTITY', 'ОсОО «Бишкек-Утиль»', '02999911122233',
    'COMPLEX', ARRAY['Сбор','Сортировка','Переработка','Хранение'],
    'г. Бишкек, ул. Профсоюзная, 76', 'г. Бишкек, Аламединский промузел, 4',
    '+996 555 111222', 'info@bishkek-util.kg', 'Султанов Р.Н.',
    'APPROVED', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days',
    TRUE, CURRENT_DATE - INTERVAL '20 days', 'Иванова Н.П., секретарь комиссии',
    'Все требования соблюдены, возражений нет.',
    100, NOW() - INTERVAL '45 days', NOW() - INTERVAL '14 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO license_payments (id, application_id, provider, provider_order_id, amount, currency, status, payment_method, paid_at, created_at, updated_at)
VALUES (2006, 1006, 'MOCK', 'MOCK-DEMO-006', 1000, 'KGS', 'SUCCESS', 'CARD',
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Ещё одна APPROVED заявка для второй лицензии (наполняем реестр) ───
INSERT INTO license_applications (
    id, applicant_type, applicant_entity, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    contact_phone, contact_email, contact_person, status, submitted_at, deadline,
    site_visit_done, site_visit_date, site_visit_inspector, site_visit_comment,
    submitted_by_id, created_at, updated_at
) VALUES (
    1007, 'LANDFILL', 'LEGAL_ENTITY', 'ОсОО «Тазалык»', '02012345678910',
    'STORAGE_DISPOSAL', ARRAY['Захоронение ТБО'],
    'г. Бишкек, ул. Фучика, 5', 'Чуйская обл., полигон «Беш-Кунгей»',
    '+996 312 554455', 'office@tazalyk.kg', 'Мамбетов С.М.',
    'APPROVED', NOW() - INTERVAL '75 days', NOW() - INTERVAL '45 days',
    TRUE, CURRENT_DATE - INTERVAL '65 days', 'Алымов Ж.Т., инспектор МПРЭТН',
    'Полигон оборудован по нормам, замечаний нет.',
    100, NOW() - INTERVAL '75 days', NOW() - INTERVAL '60 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO license_payments (id, application_id, provider, provider_order_id, amount, currency, status, payment_method, paid_at, created_at, updated_at)
VALUES (2007, 1007, 'MOCK', 'MOCK-DEMO-007', 1000, 'KGS', 'SUCCESS', 'CARD',
        NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Выданные лицензии ───
-- #1: Первая лицензия 2026 года - выдана по заявке 1006
INSERT INTO licenses (id, license_number, application_id,
    applicant_type, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    issued_at, valid_until, is_published, is_revoked,
    created_at, updated_at)
VALUES (3001, 'ЛП-2026-0001', 1006,
    'RECYCLER', 'ОсОО «Бишкек-Утиль»', '02999911122233',
    'COMPLEX', ARRAY['Сбор','Сортировка','Переработка','Хранение'],
    'г. Бишкек, ул. Профсоюзная, 76', 'г. Бишкек, Аламединский промузел, 4',
    CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '3 years',
    TRUE, FALSE, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days')
ON CONFLICT (license_number) DO NOTHING;

-- #2: Вторая лицензия - выдана ранее, по заявке 1007
INSERT INTO licenses (id, license_number, application_id,
    applicant_type, applicant_name, applicant_inn,
    license_type, activity_types, legal_address, actual_address,
    issued_at, valid_until, is_published, is_revoked,
    created_at, updated_at)
VALUES (3002, 'ЛП-2026-0002', 1007,
    'LANDFILL', 'ОсОО «Тазалык»', '02012345678910',
    'STORAGE_DISPOSAL', ARRAY['Захоронение ТБО'],
    'г. Бишкек, ул. Фучика, 5', 'Чуйская обл., полигон «Беш-Кунгей»',
    CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '5 years',
    TRUE, FALSE, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days')
ON CONFLICT (license_number) DO NOTHING;

-- Синхронизируем счётчик на 2026 год (2 уже выданных лицензии)
INSERT INTO license_number_counters (year, counter, updated_at)
VALUES (2026, 2, NOW())
ON CONFLICT (year) DO UPDATE SET counter = GREATEST(license_number_counters.counter, 2);

-- ─── Сдвигаем sequence'ы, чтобы новые записи не конфликтовали с сидом ───
SELECT setval('license_applications_id_seq', GREATEST(1100, (SELECT MAX(id) FROM license_applications)));
SELECT setval('licenses_id_seq', GREATEST(3100, (SELECT MAX(id) FROM licenses)));
SELECT setval('license_payments_id_seq', GREATEST(2100, (SELECT MAX(id) FROM license_payments)));
