-- Run once on the existing PostgreSQL database before deploying social login.
-- Normal signup still requires these fields through SignupRequest validation.
BEGIN;
ALTER TABLE member ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE member ALTER COLUMN birth DROP NOT NULL;
ALTER TABLE member ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE member ALTER COLUMN email DROP NOT NULL;
ALTER TABLE member ALTER COLUMN interested_region DROP NOT NULL;
COMMIT;
