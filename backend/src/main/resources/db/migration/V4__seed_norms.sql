-- ============================================
-- V4__seed_norms.sql
-- Нормативы переработки по ПКМ №563 / ПКМ №322
--
-- Группы 1-4:   2025=20%, 2026=30%, 2027=50%, 2028=60%, 2029=70%, 2030=80%
-- Группы 5-24:  2025=10%, 2026=20%, 2027=40%, 2028=50%, 2029=70%, 2030=80%
-- ============================================

-- Группы 1-4: повышенные нормативы
INSERT INTO recycling_norms (category_id, year, norm_percent, resolution_number)
SELECT c.id, y.year, y.norm, 'ПКМ КР №563'
FROM categories c
CROSS JOIN (VALUES
    (2025, 20.00),
    (2026, 30.00),
    (2027, 50.00),
    (2028, 60.00),
    (2029, 70.00),
    (2030, 80.00)
) AS y(year, norm)
WHERE c.group_number BETWEEN 1 AND 4;

-- Группы 5-24: стандартные нормативы
INSERT INTO recycling_norms (category_id, year, norm_percent, resolution_number)
SELECT c.id, y.year, y.norm, 'ПКМ КР №563'
FROM categories c
CROSS JOIN (VALUES
    (2025, 10.00),
    (2026, 20.00),
    (2027, 40.00),
    (2028, 50.00),
    (2029, 70.00),
    (2030, 80.00)
) AS y(year, norm)
WHERE c.group_number BETWEEN 5 AND 24;
