-- ============================================
-- V5__seed_test_users.sql
-- 5 тестовых пользователей с компаниями и лицевыми счетами
-- Пароль: test123 (BCrypt)
-- ============================================

-- BCrypt hash для "test123"
-- $2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS

-- ─── COMPANIES ───
INSERT INTO companies (id, company_name, inn, legal_form, region, address, director, contact_person, phone, email) VALUES
(1, 'ОсОО "Бишкек Трейд"',          '02312200210134', 'ОсОО', 'г. Бишкек', 'ул. Киевская 120, оф. 5',        'Исаков А.Т.',    'Мамбетов К.Н.', '+996 555 101010', 'trade@bishkek-trade.kg'),
(2, 'ГП "Эко Оператор"',             '01234500010001', 'ГП',   'г. Бишкек', 'ул. Токтогула 28',               'Сатаров Б.К.',   'Кулова А.И.',    '+996 312 900100', 'info@eco-operator.kg'),
(3, 'МПРЭТН КР',                     '00100100010001', 'ГО',   'г. Бишкек', 'ул. Тоголок Молдо 2',            'Турдубаев М.А.', 'Касымов Э.Р.',   '+996 312 541200', 'info@mpretn.gov.kg'),
(4, 'Системный администратор',        '00000000000001', 'N/A',  'г. Бишкек', 'ул. Токтогула 28',               'Admin',          'Admin',          '+996 312 900101', 'admin@eco-operator.kg'),
(5, 'ГП "Эко Оператор" (филиал)',     '01234500010002', 'ГП',   'г. Ош',     'ул. Ленина 45',                  'Алимов Р.С.',    'Базарбаев Т.К.', '+996 3222 55500', 'osh@eco-operator.kg');

-- Reset sequence
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- ─── USERS ───
INSERT INTO users (id, inn, password, company_name, role, email, phone, company_id) VALUES
(1, '02312200210134', '$2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS', 'ОсОО "Бишкек Трейд"',      'BUSINESS',      'trade@bishkek-trade.kg',  '+996 555 101010', 1),
(2, '01234500010001', '$2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS', 'ГП "Эко Оператор"',         'ECO_OPERATOR',  'info@eco-operator.kg',    '+996 312 900100', 2),
(3, '00100100010001', '$2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS', 'МПРЭТН КР',                 'MINISTRY',      'info@mpretn.gov.kg',      '+996 312 541200', 3),
(4, '00000000000001', '$2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS', 'Системный администратор',   'ADMIN',         'admin@eco-operator.kg',   '+996 312 900101', 4),
(5, '01234500010002', '$2a$10$zNTXv4bslTK.e43nkjY1dehEjtfMDshPvxnpIfri74d2FnxCUhTuS', 'ГП "Эко Оператор" (филиал)','EMPLOYEE',      'osh@eco-operator.kg',     '+996 3222 55500', 5);

-- Reset sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ─── PAYER для business-пользователя ───
INSERT INTO payers (id, company_id, category, subcategory, product_groups, registration_date, reporting_status, settlement_status, system_status, payment_status) VALUES
(1, 1, 'IMPORTER', 'MEDIUM', ARRAY['Шины и покрышки', 'Аккумуляторы свинцовые', 'Упаковка из пластика'], '2024-06-01', 'ACTIVE', 'DEBT', 'ACTIVE', 'PARTIALLY_PAID');

SELECT setval('payers_id_seq', (SELECT MAX(id) FROM payers));

-- ─── ACCOUNTS (лицевые счета) ───
INSERT INTO accounts (id, company_id, balance, total_charged, total_paid, total_offset) VALUES
(1, 1,  -1250000.00,  2500000.00, 1250000.00, 0.00),       -- Бишкек Трейд — задолженность
(2, 2,         0.00,        0.00,       0.00, 0.00),       -- Эко Оператор
(3, 3,         0.00,        0.00,       0.00, 0.00),       -- МПРЭТН
(4, 4,         0.00,        0.00,       0.00, 0.00),       -- Админ
(5, 5,         0.00,        0.00,       0.00, 0.00);       -- Сотрудник

SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));
