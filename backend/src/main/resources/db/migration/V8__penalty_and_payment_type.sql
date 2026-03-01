-- V8: Penalty fixation fields + payment type separation

-- Поля фиксации пени в calculations
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS penalty_fixed_date DATE;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS penalty_fixed_amount DECIMAL(18,2);
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS penalty_fixed_days INTEGER;

-- Тип платежа (сбор / пеня)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'FEE';

-- Назначение платежа
ALTER TABLE payments ADD COLUMN IF NOT EXISTS purpose VARCHAR(500);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_calculations_due_date ON calculations(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_calculations_penalty_fixed ON calculations(penalty_fixed_date)
    WHERE penalty_fixed_date IS NOT NULL;
