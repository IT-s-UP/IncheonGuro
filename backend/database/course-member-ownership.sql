-- Apply before deploying when Hibernate schema updates are disabled.
-- Never assign legacy courses to a guessed owner. NULL owners remain hidden.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS member_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_courses_member_id ON courses(member_id);
