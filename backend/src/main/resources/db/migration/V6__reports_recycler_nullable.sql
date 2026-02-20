-- Allow reports without recycler linkage (for business-created reports)
ALTER TABLE reports ALTER COLUMN recycler_id DROP NOT NULL;
