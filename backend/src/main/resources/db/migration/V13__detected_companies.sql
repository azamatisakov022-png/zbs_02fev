-- Таблица выявленных компаний (из ГТС/ГНС или самостоятельная регистрация)
CREATE TABLE detected_companies (
    id                  BIGSERIAL PRIMARY KEY,
    inn                 VARCHAR(14) NOT NULL,
    company_name        VARCHAR(500),
    legal_form          VARCHAR(100),
    legal_address       TEXT,
    director            VARCHAR(200),
    phone               VARCHAR(50),
    email               VARCHAR(255),
    okpo_code           VARCHAR(20),
    oked_codes          TEXT,
    source              VARCHAR(20) NOT NULL DEFAULT 'gts',
    status              VARCHAR(30) NOT NULL DEFAULT 'new',
    tnved_codes         TEXT,
    estimated_mass      DECIMAL(12,3),
    gns_status          VARCHAR(20),
    assigned_employee_id BIGINT REFERENCES users(id),
    notified_at         TIMESTAMP,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_detected_companies_inn ON detected_companies(inn);
CREATE INDEX idx_detected_companies_status ON detected_companies(status);
CREATE INDEX idx_detected_companies_source ON detected_companies(source);

COMMENT ON TABLE detected_companies IS 'Компании выявленные через ГТС/ГНС мониторинг до регистрации';
COMMENT ON COLUMN detected_companies.source IS 'gts - таможня, gns - налоговая, self - сама пришла';
COMMENT ON COLUMN detected_companies.status IS 'new, notified, in_progress, registered, rejected';
