-- V29: добавляем поля payer_type и import_date в calculations,
-- нужны для правильного вычисления dueDate (срока оплаты утильсбора).
--
-- По ТЗ:
--   producer  - dueDate = 15-е число месяца, следующего за кварталом
--   importer  - dueDate = importDate + 15 рабочих дней
--
-- Пеня начисляется только ПОСЛЕ dueDate (а не с момента ввоза).

ALTER TABLE calculations ADD COLUMN IF NOT EXISTS payer_type  VARCHAR(16);
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS import_date DATE;

CREATE INDEX IF NOT EXISTS idx_calculations_payer_type  ON calculations(payer_type);
CREATE INDEX IF NOT EXISTS idx_calculations_import_date ON calculations(import_date);
