-- ═══════════════════════════════════════════════════════════════════════════
-- V16__fix_landfill_inert_type.sql
-- Исправление enum-значений, не соответствующих Java-enum'ам (seed V15):
--   • LandfillType: 'INERT' → 'INDUSTRIAL'
--     (допустимые: MUNICIPAL | INDUSTRIAL | HAZARDOUS | MIXED)
--   • DumpStatus: 'MONITORED' → 'MONITORING'
--     (допустимые: ACTIVE | UNDER_CLEANUP | CLEANED | MONITORING)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE landfills SET type = 'INDUSTRIAL' WHERE type = 'INERT';
UPDATE dumps SET status = 'MONITORING' WHERE status = 'MONITORED';
