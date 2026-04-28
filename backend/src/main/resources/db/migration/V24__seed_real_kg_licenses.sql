-- V24: Реальные организации КР (реестр лицензий по обращению с отходами)
--
-- Источники (открытые, по согласованию с заказчиком):
--   1. 2ГИС Бишкек — категория «Утилизация (переработка) отходов»
--      https://2gis.kg/bishkek/search/Утилизация%20(переработка)%20отходов
--   2. Бизнес-каталоги и СМИ (Tazabek, Peshcom, Kaktus) — названия и адреса
--      компаний-переработчиков отходов КР
--
-- ВАЖНО: номера лицензий и ИНН — ДЕМОНСТРАЦИОННЫЕ.
-- Публичный реестр лицензий МПРЭТН по Закону КР № 195 от 19.10.2023
-- ещё не сформирован в открытом виде — наш АИС как раз его и реализует.
-- Названия компаний и адреса — реальные, чтобы реестр выглядел правдоподобно
-- для демонстрации заказчику. При передаче в продакшн — заменить на реальные
-- выданные Минприроды лицензии.

-- ─── 16 компаний КР, работающих в сфере обращения с отходами ───
INSERT INTO companies (id, company_name, inn, legal_form, region, address, director, contact_person, phone, email)
VALUES
  (200, 'ОсОО «Триод»',                       '02299011100001', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. 7 Апреля, 7',                                   'Шмидт К. В.',     'Шмидт К. В.',     '+996 312 531133', 'info@triod.kg'),
  (201, 'ОсОО «Алтын-Ажыдаар»',                '02299011100002', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Исакеева, 1а',                                  'Мамбетов С. К.',  'Мамбетов С. К.',  '+996 312 525252', 'info@altyn-ajydaar.kg'),
  (202, 'ОсОО «Эко Комплекс»',                 '02299011100003', 'ОсОО', 'Бишкек',            'г. Бишкек, 8-й микрорайон, 34',                                'Рахманов Б. М.',  'Рахманов Б. М.',  '+996 312 515151', 'info@ecocomplex.kg'),
  (203, 'ОсОО «Ихсан Эко Групп»',              '02299011100004', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Юнусалиева, 86',                                'Абдыраев Ч. М.',  'Абдыраев Ч. М.',  '+996 558 388388', 'info@ihsan-eco.kg'),
  (204, 'ОсОО «Эко Проф»',                     '02299011100005', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Тоголок Молдо, 60а',                            'Ибрагимов К. С.', 'Ибрагимов К. С.', '+996 312 505050', 'office@ecoprof.kg'),
  (205, 'ОсОО «ЭКО Грин Системс»',             '02299011100006', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Фатьянова, 1',                                  'Новиков Д. В.',   'Новиков Д. В.',   '+996 312 494949', 'info@ecogreen.kg'),
  (206, 'ОсОО «Бишкек ЦветМет»',               '02299011100007', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Льва Толстого, 130',                            'Кулов С. И.',     'Кулов С. И.',     '+996 312 484848', 'info@bishkektsvetmet.kg'),
  (207, 'ОсОО «Центр переработки полимеров»',  '02299011100008', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Интергельпо, 1 ст8',                            'Асанов А. К.',    'Асанов А. К.',    '+996 312 474747', 'info@polimer.kg'),
  (208, 'ОсОО «Родентс»',                      '02222011100009', 'ОсОО', 'Чуйская область',   'Чуйская обл., Ысык-Атинский р-н, с. Новопокровка, ул. Заречная, 161а', 'Орозалиев Т. А.', 'Орозалиев Т. А.', '+996 705 161616', 'info@rodents.kg'),
  (209, 'ОсОО «Ду Кастомс»',                   '02222011100010', 'ОсОО', 'Чуйская область',   'Чуйская обл., Аламудунский р-н, с. Мраморное, ул. Ала-Арча, 106-107',  'Ким Дон-хо',      'Ким Дон-хо',      '+996 312 454545', 'info@ducustoms.kg'),
  (210, 'ОсОО «Эко Технолоджис»',              '02299011100011', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Весёлая, 32',                                   'Султанов М. К.',  'Султанов М. К.',  '+996 312 444444', 'info@ecotech.kg'),
  (211, 'ОсОО «Грин ЭКО Компани»',             '02222011100012', 'ОсОО', 'Чуйская область',   'Чуйская обл., г. Кант, Восточная промзона, 1Б/1',              'Жумалиева Г. Т.', 'Жумалиева Г. Т.', '+996 553 121212', 'info@greeneco.kg'),
  (212, 'ИП Абакиров К. Т.',                   '20388011100013', 'ИП',   'Ош',                'г. Ош, ул. Абакир уулу Торобека, 70',                          'Абакиров К. Т.',  'Абакиров К. Т.',  '+996 555 131313', 'abakirov@mail.kg'),
  (213, 'ОсОО «Агропром Холдинг»',             '02299011100014', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Курманалиева, 124',                             'Исаева А. Р.',    'Исаева А. Р.',    '+996 708 114464', 'info@agroprom.kg'),
  (214, 'ОсОО «Эфес ЛТД»',                     '02299011100015', 'ОсОО', 'Бишкек',            'г. Бишкек, пр. Шабдана Баатыра, 2/5',                          'Бакытов А. Э.',   'Бакытов А. Э.',   '+996 558 788881', 'info@efes.kg'),
  (215, 'ОсОО «Бишкек Металлоприём»',          '02299011100016', 'ОсОО', 'Бишкек',            'г. Бишкек, ул. Фрунзе, 10',                                    'Чынгышев Б. К.',  'Чынгышев Б. К.',  '+996 312 434343', 'info@metallpriem.kg')
ON CONFLICT (inn) DO NOTHING;

-- ─── 16 одобренных заявок (все APPROVED) ────────────────────────────────
-- submitted_by_id=100 — Чистый Мир (из V22); это упрощение для демо,
-- в проде заявку подаёт тот пользователь, который её создал.
INSERT INTO license_applications (
  id, applicant_type, applicant_id, applicant_entity, applicant_name, applicant_inn,
  license_type, activity_types, legal_address, actual_address,
  contact_phone, contact_email, contact_person,
  status, submitted_at, deadline, submitted_by_id, created_at, updated_at
) VALUES
  (2020, 'RECYCLER',   200, 'LEGAL_ENTITY', 'ОсОО «Триод»',                      '02299011100001', 'PROCESSING',       ARRAY['Заготовка лома металлов','Переработка цветных металлов'],         'г. Бишкек, ул. 7 Апреля, 7',                                   'г. Бишкек, ул. 7 Апреля, 7',                                   '+996 312 531133', 'info@triod.kg',            'Шмидт К. В.',     'APPROVED', NOW() - INTERVAL '380 days', NOW() - INTERVAL '350 days', 100, NOW() - INTERVAL '380 days', NOW() - INTERVAL '350 days'),
  (2021, 'RECYCLER',   201, 'LEGAL_ENTITY', 'ОсОО «Алтын-Ажыдаар»',               '02299011100002', 'COMPLEX',          ARRAY['Сбор','Сортировка','Переработка вторсырья'],                        'г. Бишкек, ул. Исакеева, 1а',                                  'г. Бишкек, ул. Исакеева, 1а',                                  '+996 312 525252', 'info@altyn-ajydaar.kg',    'Мамбетов С. К.',  'APPROVED', NOW() - INTERVAL '320 days', NOW() - INTERVAL '290 days', 100, NOW() - INTERVAL '320 days', NOW() - INTERVAL '290 days'),
  (2022, 'OTHER',      202, 'LEGAL_ENTITY', 'ОсОО «Эко Комплекс»',                '02299011100003', 'NEUTRALIZATION',   ARRAY['Обезвреживание медицинских отходов','Утилизация опасных отходов'], 'г. Бишкек, 8-й микрорайон, 34',                                'г. Бишкек, 8-й микрорайон, 34',                                '+996 312 515151', 'info@ecocomplex.kg',       'Рахманов Б. М.',  'APPROVED', NOW() - INTERVAL '280 days', NOW() - INTERVAL '250 days', 100, NOW() - INTERVAL '280 days', NOW() - INTERVAL '250 days'),
  (2023, 'RECYCLER',   203, 'LEGAL_ENTITY', 'ОсОО «Ихсан Эко Групп»',             '02299011100004', 'COMPLEX',          ARRAY['Сбор','Транспортировка','Утилизация ТБО'],                          'г. Бишкек, ул. Юнусалиева, 86',                                'г. Бишкек, ул. Юнусалиева, 86',                                '+996 558 388388', 'info@ihsan-eco.kg',        'Абдыраев Ч. М.',  'APPROVED', NOW() - INTERVAL '240 days', NOW() - INTERVAL '210 days', 100, NOW() - INTERVAL '240 days', NOW() - INTERVAL '210 days'),
  (2024, 'RECYCLER',   204, 'LEGAL_ENTITY', 'ОсОО «Эко Проф»',                    '02299011100005', 'PROCESSING',       ARRAY['Переработка вторсырья'],                                            'г. Бишкек, ул. Тоголок Молдо, 60а',                            'г. Бишкек, ул. Тоголок Молдо, 60а',                            '+996 312 505050', 'office@ecoprof.kg',        'Ибрагимов К. С.', 'APPROVED', NOW() - INTERVAL '200 days', NOW() - INTERVAL '170 days', 100, NOW() - INTERVAL '200 days', NOW() - INTERVAL '170 days'),
  (2025, 'OTHER',      205, 'LEGAL_ENTITY', 'ОсОО «ЭКО Грин Системс»',            '02299011100006', 'NEUTRALIZATION',   ARRAY['Обезвреживание медицинских отходов','Обезвреживание промышленных отходов'], 'г. Бишкек, ул. Фатьянова, 1', 'г. Бишкек, ул. Фатьянова, 1', '+996 312 494949', 'info@ecogreen.kg', 'Новиков Д. В.', 'APPROVED', NOW() - INTERVAL '170 days', NOW() - INTERVAL '140 days', 100, NOW() - INTERVAL '170 days', NOW() - INTERVAL '140 days'),
  (2026, 'COLLECTION_POINT', 206, 'LEGAL_ENTITY', 'ОсОО «Бишкек ЦветМет»',        '02299011100007', 'COLLECTION',       ARRAY['Заготовка лома чёрных металлов','Заготовка лома цветных металлов'], 'г. Бишкек, ул. Льва Толстого, 130',                            'г. Бишкек, ул. Льва Толстого, 130',                            '+996 312 484848', 'info@bishkektsvetmet.kg',  'Кулов С. И.',     'APPROVED', NOW() - INTERVAL '150 days', NOW() - INTERVAL '120 days', 100, NOW() - INTERVAL '150 days', NOW() - INTERVAL '120 days'),
  (2027, 'RECYCLER',   207, 'LEGAL_ENTITY', 'ОсОО «Центр переработки полимеров»', '02299011100008', 'PROCESSING',       ARRAY['Переработка полиэтилена','Переработка полипропилена','Гранулирование полимеров'], 'г. Бишкек, ул. Интергельпо, 1 ст8', 'г. Бишкек, ул. Интергельпо, 1 ст8', '+996 312 474747', 'info@polimer.kg', 'Асанов А. К.', 'APPROVED', NOW() - INTERVAL '130 days', NOW() - INTERVAL '100 days', 100, NOW() - INTERVAL '130 days', NOW() - INTERVAL '100 days'),
  (2028, 'OTHER',      208, 'LEGAL_ENTITY', 'ОсОО «Родентс»',                     '02222011100009', 'NEUTRALIZATION',   ARRAY['Обезвреживание медицинских отходов','Утилизация неликвидных отходов'], 'Чуйская обл., Ысык-Атинский р-н, с. Новопокровка, ул. Заречная, 161а', 'Чуйская обл., Ысык-Атинский р-н, с. Новопокровка, ул. Заречная, 161а', '+996 705 161616', 'info@rodents.kg', 'Орозалиев Т. А.', 'APPROVED', NOW() - INTERVAL '110 days', NOW() - INTERVAL '80 days', 100, NOW() - INTERVAL '110 days', NOW() - INTERVAL '80 days'),
  (2029, 'RECYCLER',   209, 'LEGAL_ENTITY', 'ОсОО «Ду Кастомс»',                  '02222011100010', 'PROCESSING',       ARRAY['Переработка текстильных отходов'],                                  'Чуйская обл., Аламудунский р-н, с. Мраморное, ул. Ала-Арча, 106-107', 'Чуйская обл., Аламудунский р-н, с. Мраморное, ул. Ала-Арча, 106-107', '+996 312 454545', 'info@ducustoms.kg', 'Ким Дон-хо', 'APPROVED', NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days', 100, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days'),
  (2030, 'RECYCLER',   210, 'LEGAL_ENTITY', 'ОсОО «Эко Технолоджис»',             '02299011100011', 'PROCESSING',       ARRAY['Переработка вторсырья'],                                            'г. Бишкек, ул. Весёлая, 32',                                   'г. Бишкек, ул. Весёлая, 32',                                   '+996 312 444444', 'info@ecotech.kg',          'Султанов М. К.',  'APPROVED', NOW() - INTERVAL '1100 days', NOW() - INTERVAL '1070 days', 100, NOW() - INTERVAL '1100 days', NOW() - INTERVAL '1070 days'),
  (2031, 'RECYCLER',   211, 'LEGAL_ENTITY', 'ОсОО «Грин ЭКО Компани»',            '02222011100012', 'PROCESSING',       ARRAY['Переработка отработанных масел','Регенерация масел'],               'Чуйская обл., г. Кант, Восточная промзона, 1Б/1',              'Чуйская обл., г. Кант, Восточная промзона, 1Б/1',              '+996 553 121212', 'info@greeneco.kg',         'Жумалиева Г. Т.', 'APPROVED', NOW() - INTERVAL '40 days',  NOW() - INTERVAL '10 days', 100, NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days'),
  (2032, 'COLLECTION_POINT', 212, 'SOLE_PROPRIETOR', 'ИП Абакиров К. Т.',         '20388011100013', 'COLLECTION',       ARRAY['Сбор макулатуры','Сбор картона','Сбор полиэтилена'],                'г. Ош, ул. Абакир уулу Торобека, 70',                          'г. Ош, ул. Абакир уулу Торобека, 70',                          '+996 555 131313', 'abakirov@mail.kg',         'Абакиров К. Т.',  'APPROVED', NOW() - INTERVAL '900 days', NOW() - INTERVAL '870 days', 100, NOW() - INTERVAL '900 days', NOW() - INTERVAL '870 days'),
  (2033, 'RECYCLER',   213, 'LEGAL_ENTITY', 'ОсОО «Агропром Холдинг»',            '02299011100014', 'PROCESSING',       ARRAY['Переработка бумаги','Переработка пластмасс','Переработка резиновых отходов'], 'г. Бишкек, ул. Курманалиева, 124', 'г. Бишкек, ул. Курманалиева, 124', '+996 708 114464', 'info@agroprom.kg', 'Исаева А. Р.', 'APPROVED', NOW() - INTERVAL '500 days', NOW() - INTERVAL '470 days', 100, NOW() - INTERVAL '500 days', NOW() - INTERVAL '470 days'),
  (2034, 'RECYCLER',   214, 'LEGAL_ENTITY', 'ОсОО «Эфес ЛТД»',                    '02299011100015', 'PROCESSING',       ARRAY['Переработка бумаги и картона'],                                     'г. Бишкек, пр. Шабдана Баатыра, 2/5',                          'г. Бишкек, пр. Шабдана Баатыра, 2/5',                          '+996 558 788881', 'info@efes.kg',             'Бакытов А. Э.',   'APPROVED', NOW() - INTERVAL '600 days', NOW() - INTERVAL '570 days', 100, NOW() - INTERVAL '600 days', NOW() - INTERVAL '570 days'),
  (2035, 'COLLECTION_POINT', 215, 'LEGAL_ENTITY', 'ОсОО «Бишкек Металлоприём»',   '02299011100016', 'COLLECTION',       ARRAY['Заготовка лома чёрных металлов'],                                   'г. Бишкек, ул. Фрунзе, 10',                                    'г. Бишкек, ул. Фрунзе, 10',                                    '+996 312 434343', 'info@metallpriem.kg',      'Чынгышев Б. К.',  'APPROVED', NOW() - INTERVAL '700 days', NOW() - INTERVAL '670 days', 100, NOW() - INTERVAL '700 days', NOW() - INTERVAL '670 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Успешные платежи для этих заявок ───────────────────────────────────
INSERT INTO license_payments (id, application_id, provider, provider_order_id, amount, currency, status, payment_method, paid_at, created_at, updated_at)
VALUES
  (3020, 2020, 'MOCK', 'MOCK-REAL-001', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '378 days', NOW() - INTERVAL '378 days', NOW() - INTERVAL '378 days'),
  (3021, 2021, 'MOCK', 'MOCK-REAL-002', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '318 days', NOW() - INTERVAL '318 days', NOW() - INTERVAL '318 days'),
  (3022, 2022, 'MOCK', 'MOCK-REAL-003', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '278 days', NOW() - INTERVAL '278 days', NOW() - INTERVAL '278 days'),
  (3023, 2023, 'MOCK', 'MOCK-REAL-004', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '238 days', NOW() - INTERVAL '238 days', NOW() - INTERVAL '238 days'),
  (3024, 2024, 'MOCK', 'MOCK-REAL-005', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '198 days', NOW() - INTERVAL '198 days', NOW() - INTERVAL '198 days'),
  (3025, 2025, 'MOCK', 'MOCK-REAL-006', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '168 days', NOW() - INTERVAL '168 days', NOW() - INTERVAL '168 days'),
  (3026, 2026, 'MOCK', 'MOCK-REAL-007', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '148 days', NOW() - INTERVAL '148 days', NOW() - INTERVAL '148 days'),
  (3027, 2027, 'MOCK', 'MOCK-REAL-008', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '128 days', NOW() - INTERVAL '128 days', NOW() - INTERVAL '128 days'),
  (3028, 2028, 'MOCK', 'MOCK-REAL-009', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '108 days', NOW() - INTERVAL '108 days', NOW() - INTERVAL '108 days'),
  (3029, 2029, 'MOCK', 'MOCK-REAL-010', 1000, 'KGS', 'MANUAL_CONFIRMED', 'BANK_TRANSFER', NOW() - INTERVAL '88 days', NOW() - INTERVAL '88 days', NOW() - INTERVAL '88 days'),
  (3030, 2030, 'MOCK', 'MOCK-REAL-011', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '1098 days', NOW() - INTERVAL '1098 days', NOW() - INTERVAL '1098 days'),
  (3031, 2031, 'MOCK', 'MOCK-REAL-012', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days'),
  (3032, 2032, 'MOCK', 'MOCK-REAL-013', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '898 days', NOW() - INTERVAL '898 days', NOW() - INTERVAL '898 days'),
  (3033, 2033, 'MOCK', 'MOCK-REAL-014', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '498 days', NOW() - INTERVAL '498 days', NOW() - INTERVAL '498 days'),
  (3034, 2034, 'MOCK', 'MOCK-REAL-015', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '598 days', NOW() - INTERVAL '598 days', NOW() - INTERVAL '598 days'),
  (3035, 2035, 'MOCK', 'MOCK-REAL-016', 1000, 'KGS', 'SUCCESS', 'CARD', NOW() - INTERVAL '698 days', NOW() - INTERVAL '698 days', NOW() - INTERVAL '698 days')
ON CONFLICT (id) DO NOTHING;

-- ─── Выданные лицензии ──────────────────────────────────────────────────
-- Раскладка по статусам:
--   #4020–#4025, #4028, #4031, #4033 — ACTIVE (valid_until > today + 90 дней)
--   #4027, #4029 — EXPIRING (истекают в ближайшие 90 дней)
--   #4030, #4032 — EXPIRED (просрочены)
--   #4034, #4035 — REVOKED (отозванные)
--   #4026 — ACTIVE (недавно выдана, 2025)
-- issued_by_id = 5 (EMPLOYEE «ГП Эко Оператор филиал» из V5).

INSERT INTO licenses (id, license_number, application_id, applicant_type, applicant_id, applicant_name, applicant_inn, license_type, activity_types, legal_address, actual_address, issued_at, valid_until, is_published, is_revoked, revoked_at, revocation_reason, issued_by_id)
VALUES
  -- ACTIVE: выданы в 2024–2025, действуют до 2027–2029
  (4020, 'ЛП-2024-0001', 2020, 'RECYCLER',         200, 'ОсОО «Триод»',                      '02299011100001', 'PROCESSING',       ARRAY['Заготовка лома металлов','Переработка цветных металлов'],         'г. Бишкек, ул. 7 Апреля, 7',                                   'г. Бишкек, ул. 7 Апреля, 7',                                   (NOW() - INTERVAL '350 days')::date, (NOW() + INTERVAL '2 years' - INTERVAL '350 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4021, 'ЛП-2024-0002', 2021, 'RECYCLER',         201, 'ОсОО «Алтын-Ажыдаар»',               '02299011100002', 'COMPLEX',          ARRAY['Сбор','Сортировка','Переработка вторсырья'],                        'г. Бишкек, ул. Исакеева, 1а',                                  'г. Бишкек, ул. Исакеева, 1а',                                  (NOW() - INTERVAL '290 days')::date, (NOW() + INTERVAL '2 years' - INTERVAL '290 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4022, 'ЛП-2024-0003', 2022, 'OTHER',             202, 'ОсОО «Эко Комплекс»',                '02299011100003', 'NEUTRALIZATION',   ARRAY['Обезвреживание медицинских отходов','Утилизация опасных отходов'], 'г. Бишкек, 8-й микрорайон, 34',                                'г. Бишкек, 8-й микрорайон, 34',                                (NOW() - INTERVAL '250 days')::date, (NOW() + INTERVAL '3 years' - INTERVAL '250 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4023, 'ЛП-2024-0004', 2023, 'RECYCLER',         203, 'ОсОО «Ихсан Эко Групп»',             '02299011100004', 'COMPLEX',          ARRAY['Сбор','Транспортировка','Утилизация ТБО'],                          'г. Бишкек, ул. Юнусалиева, 86',                                'г. Бишкек, ул. Юнусалиева, 86',                                (NOW() - INTERVAL '210 days')::date, (NOW() + INTERVAL '3 years' - INTERVAL '210 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4024, 'ЛП-2025-0001', 2024, 'RECYCLER',         204, 'ОсОО «Эко Проф»',                    '02299011100005', 'PROCESSING',       ARRAY['Переработка вторсырья'],                                            'г. Бишкек, ул. Тоголок Молдо, 60а',                            'г. Бишкек, ул. Тоголок Молдо, 60а',                            (NOW() - INTERVAL '170 days')::date, (NOW() + INTERVAL '2 years' - INTERVAL '170 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4025, 'ЛП-2025-0002', 2025, 'OTHER',             205, 'ОсОО «ЭКО Грин Системс»',            '02299011100006', 'NEUTRALIZATION',   ARRAY['Обезвреживание медицинских отходов','Обезвреживание промышленных отходов'], 'г. Бишкек, ул. Фатьянова, 1', 'г. Бишкек, ул. Фатьянова, 1', (NOW() - INTERVAL '140 days')::date, (NOW() + INTERVAL '3 years' - INTERVAL '140 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4026, 'ЛП-2025-0003', 2026, 'COLLECTION_POINT', 206, 'ОсОО «Бишкек ЦветМет»',              '02299011100007', 'COLLECTION',       ARRAY['Заготовка лома чёрных металлов','Заготовка лома цветных металлов'], 'г. Бишкек, ул. Льва Толстого, 130',                            'г. Бишкек, ул. Льва Толстого, 130',                            (NOW() - INTERVAL '120 days')::date, (NOW() + INTERVAL '2 years' - INTERVAL '120 days')::date, TRUE, FALSE, NULL, NULL, 5),

  -- EXPIRING: истекают в ближайшие 90 дней
  (4027, 'ЛП-2025-0004', 2027, 'RECYCLER',         207, 'ОсОО «Центр переработки полимеров»', '02299011100008', 'PROCESSING',       ARRAY['Переработка полиэтилена','Переработка полипропилена','Гранулирование полимеров'], 'г. Бишкек, ул. Интергельпо, 1 ст8', 'г. Бишкек, ул. Интергельпо, 1 ст8', (NOW() - INTERVAL '730 days')::date, (NOW() + INTERVAL '45 days')::date,  TRUE, FALSE, NULL, NULL, 5),
  (4028, 'ЛП-2025-0005', 2028, 'OTHER',             208, 'ОсОО «Родентс»',                     '02222011100009', 'NEUTRALIZATION',   ARRAY['Обезвреживание медицинских отходов','Утилизация неликвидных отходов'], 'Чуйская обл., Ысык-Атинский р-н, с. Новопокровка, ул. Заречная, 161а', 'Чуйская обл., Ысык-Атинский р-н, с. Новопокровка, ул. Заречная, 161а', (NOW() - INTERVAL '80 days')::date,  (NOW() + INTERVAL '2 years' - INTERVAL '80 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4029, 'ЛП-2023-0012', 2029, 'RECYCLER',         209, 'ОсОО «Ду Кастомс»',                  '02222011100010', 'PROCESSING',       ARRAY['Переработка текстильных отходов'],                                  'Чуйская обл., Аламудунский р-н, с. Мраморное, ул. Ала-Арча, 106-107', 'Чуйская обл., Аламудунский р-н, с. Мраморное, ул. Ала-Арча, 106-107', (NOW() - INTERVAL '1020 days')::date, (NOW() + INTERVAL '70 days')::date, TRUE, FALSE, NULL, NULL, 5),

  -- EXPIRED: срок истёк, не отозвана
  (4030, 'ЛП-2022-0007', 2030, 'RECYCLER',         210, 'ОсОО «Эко Технолоджис»',             '02299011100011', 'PROCESSING',       ARRAY['Переработка вторсырья'],                                            'г. Бишкек, ул. Весёлая, 32',                                   'г. Бишкек, ул. Весёлая, 32',                                   (NOW() - INTERVAL '1070 days')::date, (NOW() - INTERVAL '175 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4031, 'ЛП-2025-0006', 2031, 'RECYCLER',         211, 'ОсОО «Грин ЭКО Компани»',            '02222011100012', 'PROCESSING',       ARRAY['Переработка отработанных масел','Регенерация масел'],               'Чуйская обл., г. Кант, Восточная промзона, 1Б/1',              'Чуйская обл., г. Кант, Восточная промзона, 1Б/1',              (NOW() - INTERVAL '10 days')::date,  (NOW() + INTERVAL '3 years' - INTERVAL '10 days')::date,  TRUE, FALSE, NULL, NULL, 5),
  (4032, 'ЛП-2022-0001', 2032, 'COLLECTION_POINT', 212, 'ИП Абакиров К. Т.',                   '20388011100013', 'COLLECTION',       ARRAY['Сбор макулатуры','Сбор картона','Сбор полиэтилена'],                'г. Ош, ул. Абакир уулу Торобека, 70',                          'г. Ош, ул. Абакир уулу Торобека, 70',                          (NOW() - INTERVAL '870 days')::date, (NOW() - INTERVAL '45 days')::date, TRUE, FALSE, NULL, NULL, 5),
  (4033, 'ЛП-2023-0005', 2033, 'RECYCLER',         213, 'ОсОО «Агропром Холдинг»',            '02299011100014', 'PROCESSING',       ARRAY['Переработка бумаги','Переработка пластмасс','Переработка резиновых отходов'], 'г. Бишкек, ул. Курманалиева, 124', 'г. Бишкек, ул. Курманалиева, 124', (NOW() - INTERVAL '470 days')::date, (NOW() + INTERVAL '5 years' - INTERVAL '470 days')::date, TRUE, FALSE, NULL, NULL, 5),

  -- REVOKED: отозванные лицензии
  (4034, 'ЛП-2023-0002', 2034, 'RECYCLER',         214, 'ОсОО «Эфес ЛТД»',                    '02299011100015', 'PROCESSING',       ARRAY['Переработка бумаги и картона'],                                     'г. Бишкек, пр. Шабдана Баатыра, 2/5',                          'г. Бишкек, пр. Шабдана Баатыра, 2/5',                          (NOW() - INTERVAL '570 days')::date, (NOW() + INTERVAL '3 years' - INTERVAL '570 days')::date, TRUE, TRUE, NOW() - INTERVAL '120 days', 'Нарушение экологических требований (пункт 3 ст. 14 Закона КР № 195)', 5),
  (4035, 'ЛП-2022-0003', 2035, 'COLLECTION_POINT', 215, 'ОсОО «Бишкек Металлоприём»',         '02299011100016', 'COLLECTION',       ARRAY['Заготовка лома чёрных металлов'],                                   'г. Бишкек, ул. Фрунзе, 10',                                    'г. Бишкек, ул. Фрунзе, 10',                                    (NOW() - INTERVAL '670 days')::date, (NOW() + INTERVAL '3 years' - INTERVAL '670 days')::date, TRUE, TRUE, NOW() - INTERVAL '200 days', 'Прекращение деятельности по заявлению держателя', 5)
ON CONFLICT (id) DO NOTHING;

-- Связь заявка ↔ лицензия поддерживается через licenses.application_id (уже задан).
-- Отдельного license_id в license_applications нет — Jsp-endpoint вычисляет его JOIN'ом.

-- Обновляем счётчик номеров лицензий по годам (чтобы при новых выдачах
-- автоинкремент продолжался с правильного номера)
INSERT INTO license_number_counters (year, counter) VALUES (2022, 10) ON CONFLICT (year) DO UPDATE SET counter = GREATEST(license_number_counters.counter, 10);
INSERT INTO license_number_counters (year, counter) VALUES (2023, 15) ON CONFLICT (year) DO UPDATE SET counter = GREATEST(license_number_counters.counter, 15);
INSERT INTO license_number_counters (year, counter) VALUES (2024, 10) ON CONFLICT (year) DO UPDATE SET counter = GREATEST(license_number_counters.counter, 10);
INSERT INTO license_number_counters (year, counter) VALUES (2025, 15) ON CONFLICT (year) DO UPDATE SET counter = GREATEST(license_number_counters.counter, 15);
