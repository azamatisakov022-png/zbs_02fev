-- ============================================
-- V13__create_product_groups.sql
-- DDL: справочник товарных групп ПКМ КР №730
-- Таблицы: product_groups, product_subgroups,
--          product_group_rates, product_group_norms
-- ============================================

-- ─── PRODUCT GROUPS (24 группы) ───
CREATE TABLE product_groups (
    id              BIGSERIAL PRIMARY KEY,
    group_number    INTEGER NOT NULL UNIQUE,
    name            VARCHAR(500) NOT NULL,
    code            VARCHAR(30) NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('PRODUCT', 'PACKAGING')),
    unit            VARCHAR(20) NOT NULL DEFAULT 'сом/т',
    section_letter  VARCHAR(1),
    section_name    VARCHAR(200),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_product_groups_group_number ON product_groups(group_number);
CREATE INDEX idx_product_groups_type ON product_groups(type);

-- ─── PRODUCT SUBGROUPS (347 подгрупп) ───
CREATE TABLE product_subgroups (
    id                      BIGSERIAL PRIMARY KEY,
    product_group_id        BIGINT NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    gskp_code               VARCHAR(30) NOT NULL,
    tnved_code              VARCHAR(50),
    tnved_name              TEXT,
    type                    VARCHAR(20) NOT NULL CHECK (type IN ('PRODUCT', 'PACKAGING')),
    rate_multiplier         NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    packaging_material      VARCHAR(200),
    packaging_letter_code   VARCHAR(10),
    packaging_digital_code  VARCHAR(10),
    sort_order              INTEGER NOT NULL DEFAULT 0,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_product_subgroups_group_id ON product_subgroups(product_group_id);
CREATE INDEX idx_product_subgroups_gskp ON product_subgroups(gskp_code);
CREATE INDEX idx_product_subgroups_tnved ON product_subgroups(tnved_code);

-- ─── PRODUCT GROUP RATES (ставки с версионированием) ───
CREATE TABLE product_group_rates (
    id                  BIGSERIAL PRIMARY KEY,
    product_group_id    BIGINT NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
    rate_per_ton        NUMERIC(15,2) NOT NULL,
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    resolution_number   VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_product_group_rates_group_id ON product_group_rates(product_group_id);
CREATE INDEX idx_product_group_rates_effective ON product_group_rates(effective_from, effective_to);

-- ─── PRODUCT GROUP NORMS (нормативы по годам) ───
CREATE TABLE product_group_norms (
    id                  BIGSERIAL PRIMARY KEY,
    product_group_id    BIGINT NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
    year                INTEGER NOT NULL,
    norm_percent        NUMERIC(5,2) NOT NULL,
    resolution_number   VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (product_group_id, year)
);
CREATE INDEX idx_product_group_norms_group_year ON product_group_norms(product_group_id, year);
