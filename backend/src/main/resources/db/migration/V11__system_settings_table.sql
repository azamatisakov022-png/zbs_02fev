-- System settings key-value store
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed default settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('systemName', 'АИС «ГП Эко Оператор»'),
('defaultCurrency', 'KGS'),
('maxFileSize', '50MB');
