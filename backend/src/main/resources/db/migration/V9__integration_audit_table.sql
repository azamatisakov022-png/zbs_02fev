-- ============================================
-- V9__integration_audit_table.sql
-- Лог вызовов внешних систем (ГНС, ГТС, банки)
-- ============================================

CREATE TABLE IF NOT EXISTS integration_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    service_name    VARCHAR(50)  NOT NULL,     -- 'TAX_SERVICE', 'CUSTOMS_SERVICE', 'BANKING'
    operation       VARCHAR(100) NOT NULL,     -- 'verifyInn', 'getImportDeclarations', etc.
    request_payload TEXT,
    response_payload TEXT,
    status          VARCHAR(20)  NOT NULL,     -- 'SUCCESS', 'FAILURE', 'TIMEOUT'
    error_message   TEXT,
    duration_ms     INTEGER,
    company_inn     VARCHAR(14),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_integration_audit_service ON integration_audit_log(service_name);
CREATE INDEX idx_integration_audit_inn ON integration_audit_log(company_inn);
CREATE INDEX idx_integration_audit_created ON integration_audit_log(created_at);
