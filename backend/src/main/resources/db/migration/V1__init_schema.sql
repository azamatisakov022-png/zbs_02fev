-- ============================================
-- V1__init_schema.sql
-- АИС «ГП Эко Оператор» — Initial DB schema
-- ============================================

-- ─── COMPANIES ───
CREATE TABLE companies (
    id              BIGSERIAL PRIMARY KEY,
    company_name    VARCHAR(255) NOT NULL,
    inn             VARCHAR(14) NOT NULL UNIQUE,
    legal_form      VARCHAR(50),
    region          VARCHAR(100),
    address         TEXT,
    director        VARCHAR(100),
    contact_person  VARCHAR(100),
    phone           VARCHAR(30),
    email           VARCHAR(100),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_companies_inn ON companies(inn);

-- ─── USERS ───
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    inn             VARCHAR(14) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    company_name    VARCHAR(255),
    role            VARCHAR(20) NOT NULL,
    email           VARCHAR(100),
    phone           VARCHAR(30),
    company_id      BIGINT REFERENCES companies(id),
    refresh_token   TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_inn ON users(inn);
CREATE INDEX idx_users_company_id ON users(company_id);

-- ─── PAYERS ───
CREATE TABLE payers (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL REFERENCES companies(id),
    category            VARCHAR(30) NOT NULL,
    subcategory         VARCHAR(20),
    product_groups      TEXT[],
    registration_date   DATE,
    reporting_status    VARCHAR(20),
    settlement_status   VARCHAR(20),
    system_status       VARCHAR(20),
    payment_status      VARCHAR(20),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payers_company_id ON payers(company_id);
CREATE INDEX idx_payers_category ON payers(category);

-- ─── CATEGORIES ───
CREATE TABLE categories (
    id              BIGSERIAL PRIMARY KEY,
    group_number    INTEGER NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    unit            VARCHAR(20)
);

-- ─── RATES ───
CREATE TABLE rates (
    id                  BIGSERIAL PRIMARY KEY,
    category_id         BIGINT NOT NULL REFERENCES categories(id),
    rate_per_unit       NUMERIC(15,2) NOT NULL,
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    resolution_number   VARCHAR(50)
);
CREATE INDEX idx_rates_category_id ON rates(category_id);

-- ─── RECYCLING NORMS ───
CREATE TABLE recycling_norms (
    id                  BIGSERIAL PRIMARY KEY,
    category_id         BIGINT NOT NULL REFERENCES categories(id),
    year                INTEGER NOT NULL,
    norm_percent        NUMERIC(5,2) NOT NULL,
    resolution_number   VARCHAR(50),
    UNIQUE (category_id, year)
);
CREATE INDEX idx_recycling_norms_category_year ON recycling_norms(category_id, year);

-- ─── CALCULATIONS ───
CREATE TABLE calculations (
    id                  BIGSERIAL PRIMARY KEY,
    number              VARCHAR(30) NOT NULL UNIQUE,
    company_id          BIGINT NOT NULL REFERENCES companies(id),
    period              VARCHAR(50),
    quarter             VARCHAR(20),
    document_type       VARCHAR(20),
    document_number     VARCHAR(50),
    document_date       DATE,
    total_amount        NUMERIC(15,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    review_comment      TEXT,
    reviewed_by         VARCHAR(100),
    reviewed_at         TIMESTAMP,
    submitted_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_calculations_company_id ON calculations(company_id);
CREATE INDEX idx_calculations_status ON calculations(status);

-- ─── CALCULATION ITEMS ───
CREATE TABLE calculation_items (
    id                  BIGSERIAL PRIMARY KEY,
    calculation_id      BIGINT NOT NULL REFERENCES calculations(id) ON DELETE CASCADE,
    product_group       VARCHAR(255) NOT NULL,
    product_subgroup    VARCHAR(255),
    tnved_code          VARCHAR(20),
    gskp_code           VARCHAR(20),
    product_name        VARCHAR(255),
    quantity            NUMERIC(15,4),
    unit                VARCHAR(20),
    weight              NUMERIC(15,4),
    rate                NUMERIC(15,2),
    amount              NUMERIC(15,2),
    recycling_norm      NUMERIC(5,2)
);
CREATE INDEX idx_calculation_items_calc_id ON calculation_items(calculation_id);

-- ─── DECLARATIONS ───
CREATE TABLE declarations (
    id                  BIGSERIAL PRIMARY KEY,
    number              VARCHAR(30) NOT NULL UNIQUE,
    company_id          BIGINT NOT NULL REFERENCES companies(id),
    year                INTEGER NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_charged       NUMERIC(15,2),
    total_paid          NUMERIC(15,2),
    total_offset        NUMERIC(15,2),
    balance             NUMERIC(15,2),
    submitted_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_declarations_company_id ON declarations(company_id);
CREATE INDEX idx_declarations_status ON declarations(status);

-- ─── DECLARATION ITEMS ───
CREATE TABLE declaration_items (
    id                  BIGSERIAL PRIMARY KEY,
    declaration_id      BIGINT NOT NULL REFERENCES declarations(id) ON DELETE CASCADE,
    calculation_id      BIGINT REFERENCES calculations(id),
    number              VARCHAR(30),
    period              VARCHAR(50),
    amount              NUMERIC(15,2),
    status              VARCHAR(20)
);
CREATE INDEX idx_declaration_items_decl_id ON declaration_items(declaration_id);

-- ─── RECYCLERS ───
CREATE TABLE recyclers (
    id                      BIGSERIAL PRIMARY KEY,
    company_name            VARCHAR(255) NOT NULL,
    legal_form              VARCHAR(50),
    inn                     VARCHAR(14) NOT NULL UNIQUE,
    region                  VARCHAR(100),
    address                 TEXT,
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    director                VARCHAR(100),
    director_position       VARCHAR(100),
    contact_person          VARCHAR(100),
    contact_position        VARCHAR(100),
    phone                   VARCHAR(30),
    email                   VARCHAR(100),
    license_number          VARCHAR(50),
    license_date            DATE,
    license_expiry          DATE,
    license_issuer          VARCHAR(255),
    eco_passport_number     VARCHAR(50),
    eco_passport_date       DATE,
    technologies            TEXT[],
    equipment               TEXT,
    territory_area          NUMERIC(12,2),
    employees_count         INTEGER,
    certifications          TEXT[],
    inspection_status       VARCHAR(30),
    last_inspection_date    DATE,
    inspection_remarks      TEXT,
    next_inspection_date    DATE,
    volume_current_year     NUMERIC(15,4),
    volume_previous_year    NUMERIC(15,4),
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    suspension_reason       TEXT,
    last_updated            TIMESTAMP DEFAULT NOW(),
    notes                   TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recyclers_inn ON recyclers(inn);
CREATE INDEX idx_recyclers_status ON recyclers(status);

-- ─── RECYCLER CAPACITIES ───
CREATE TABLE recycler_capacities (
    id                  BIGSERIAL PRIMARY KEY,
    recycler_id         BIGINT NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    waste_group         VARCHAR(255) NOT NULL,
    waste_code          VARCHAR(20),
    monthly_capacity    NUMERIC(15,4) NOT NULL,
    annual_capacity     NUMERIC(15,4),
    current_load        NUMERIC(15,4),
    load_percent        NUMERIC(5,2),
    technology          VARCHAR(200)
);
CREATE INDEX idx_recycler_capacities_recycler_id ON recycler_capacities(recycler_id);

-- ─── REPORTS ───
CREATE TABLE reports (
    id                  BIGSERIAL PRIMARY KEY,
    number              VARCHAR(30) NOT NULL UNIQUE,
    recycler_id         BIGINT NOT NULL REFERENCES recyclers(id),
    period              VARCHAR(20),
    status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    submitted_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reports_recycler_id ON reports(recycler_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ─── REPORT ITEMS ───
CREATE TABLE report_items (
    id                  BIGSERIAL PRIMARY KEY,
    report_id           BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    waste_group         VARCHAR(255) NOT NULL,
    waste_code          VARCHAR(20),
    volume_received     NUMERIC(15,4),
    volume_processed    NUMERIC(15,4),
    recycling_percent   NUMERIC(5,2),
    recycling_norm      NUMERIC(5,2),
    technology          VARCHAR(200)
);
CREATE INDEX idx_report_items_report_id ON report_items(report_id);

-- ─── ACCOUNTS ───
CREATE TABLE accounts (
    id                  BIGSERIAL PRIMARY KEY,
    company_id          BIGINT NOT NULL UNIQUE REFERENCES companies(id),
    balance             NUMERIC(15,2) DEFAULT 0,
    total_charged       NUMERIC(15,2) DEFAULT 0,
    total_paid          NUMERIC(15,2) DEFAULT 0,
    total_offset        NUMERIC(15,2) DEFAULT 0,
    last_updated        TIMESTAMP DEFAULT NOW(),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_accounts_company_id ON accounts(company_id);

-- ─── TRANSACTIONS ───
CREATE TABLE transactions (
    id                  BIGSERIAL PRIMARY KEY,
    account_id          BIGINT NOT NULL REFERENCES accounts(id),
    date                DATE NOT NULL,
    type                VARCHAR(20) NOT NULL,
    description         TEXT,
    debit               NUMERIC(15,2),
    credit              NUMERIC(15,2),
    balance             NUMERIC(15,2),
    reference_id        BIGINT,
    reference_type      VARCHAR(20)
);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- ─── PAYMENTS ───
CREATE TABLE payments (
    id                  BIGSERIAL PRIMARY KEY,
    payment_number      VARCHAR(30) NOT NULL UNIQUE,
    calculation_id      BIGINT REFERENCES calculations(id),
    company_id          BIGINT NOT NULL REFERENCES companies(id),
    amount              NUMERIC(15,2) NOT NULL,
    payment_date        DATE NOT NULL,
    payment_method      VARCHAR(20),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    document_url        TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ─── REFUNDS ───
CREATE TABLE refunds (
    id                  BIGSERIAL PRIMARY KEY,
    number              VARCHAR(30) NOT NULL UNIQUE,
    company_id          BIGINT NOT NULL REFERENCES companies(id),
    total_amount        NUMERIC(15,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comment             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_refunds_company_id ON refunds(company_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- ─── REFUND ITEMS ───
CREATE TABLE refund_items (
    id                  BIGSERIAL PRIMARY KEY,
    refund_id           BIGINT NOT NULL REFERENCES refunds(id) ON DELETE CASCADE,
    calculation_id      BIGINT REFERENCES calculations(id),
    amount              NUMERIC(15,2) NOT NULL,
    reason              VARCHAR(20) NOT NULL
);
CREATE INDEX idx_refund_items_refund_id ON refund_items(refund_id);

-- ─── NOTIFICATIONS ───
CREATE TABLE notifications (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    type                VARCHAR(20) NOT NULL,
    target_role         VARCHAR(20),
    user_id             BIGINT REFERENCES users(id),
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id        BIGINT,
    reference_type      VARCHAR(30),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_target_role ON notifications(target_role);

-- ─── NOTIFICATION TEMPLATES ───
CREATE TABLE notification_templates (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(50) NOT NULL UNIQUE,
    title               VARCHAR(255) NOT NULL,
    message_template    TEXT NOT NULL,
    type                VARCHAR(20) NOT NULL
);

-- ─── DUMPS ───
CREATE TABLE dumps (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    region              VARCHAR(100),
    address             TEXT,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    area                NUMERIC(12,2),
    estimated_volume    NUMERIC(15,4),
    waste_types         TEXT[],
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    discovered_date     DATE,
    photos              TEXT[],
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_dumps_status ON dumps(status);
CREATE INDEX idx_dumps_region ON dumps(region);

-- ─── COLLECTION POINTS ───
CREATE TABLE collection_points (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    region              VARCHAR(100),
    address             TEXT,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    waste_types         TEXT[],
    operating_hours     VARCHAR(100),
    contact_phone       VARCHAR(30),
    operator            VARCHAR(200),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_collection_points_status ON collection_points(status);
CREATE INDEX idx_collection_points_region ON collection_points(region);

-- ─── LANDFILLS ───
CREATE TABLE landfills (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    type                    VARCHAR(20) NOT NULL,
    region                  VARCHAR(100),
    address                 TEXT,
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    area                    NUMERIC(12,2),
    design_capacity         NUMERIC(15,2),
    current_volume          NUMERIC(15,2),
    fill_percent            NUMERIC(5,2),
    year_opened             INTEGER,
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    operator                VARCHAR(200),
    -- infrastructure
    has_weigh_station       BOOLEAN DEFAULT FALSE,
    has_fencing             BOOLEAN DEFAULT FALSE,
    has_access_road         BOOLEAN DEFAULT FALSE,
    has_water_monitoring    BOOLEAN DEFAULT FALSE,
    has_gas_collection      BOOLEAN DEFAULT FALSE,
    has_leachate_system     BOOLEAN DEFAULT FALSE,
    -- equipment
    bulldozers              INTEGER DEFAULT 0,
    compactors              INTEGER DEFAULT 0,
    excavators              INTEGER DEFAULT 0,
    trucks                  INTEGER DEFAULT 0,
    -- morphological composition (%)
    morph_organic           NUMERIC(5,2),
    morph_paper             NUMERIC(5,2),
    morph_plastic           NUMERIC(5,2),
    morph_glass             NUMERIC(5,2),
    morph_metal             NUMERIC(5,2),
    morph_textile           NUMERIC(5,2),
    morph_other             NUMERIC(5,2),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_landfills_status ON landfills(status);
CREATE INDEX idx_landfills_region ON landfills(region);

-- ─── DOCUMENTS ───
CREATE TABLE documents (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    type                VARCHAR(20),
    url                 TEXT NOT NULL,
    size                BIGINT,
    entity_type         VARCHAR(30),
    entity_id           BIGINT,
    uploaded_at         TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);

-- ─── AUDIT LOG ───
CREATE TABLE audit_log (
    id                  BIGSERIAL PRIMARY KEY,
    action              VARCHAR(255) NOT NULL,
    user_name           VARCHAR(100),
    user_id             BIGINT REFERENCES users(id),
    entity_type         VARCHAR(30),
    entity_id           BIGINT,
    details             TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
