-- Add seed data flags to distinguish test data from real data in production
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_seed_data BOOLEAN DEFAULT FALSE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_seed_data BOOLEAN DEFAULT FALSE;

-- Mark existing seed records from V5
UPDATE users SET is_seed_data = TRUE WHERE inn IN (
    '02312200210134', '01234500010001', '00100100010001', '99900100010001'
);
UPDATE companies SET is_seed_data = TRUE WHERE inn IN (
    '02312200210134', '01234500010001', '00100100010001'
);
