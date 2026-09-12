-- ==========================================
-- IncheonGuro 스탬프 투어 테이블
--
-- member_region_stay
-- : 사용자의 현재 지역 체류 상태 저장
--
-- member_stamp
-- : 사용자가 획득 완료한 지역 스탬프 저장
-- ==========================================


CREATE TABLE IF NOT EXISTS member_region_stay
(
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    region_id BIGINT NOT NULL,
    entered_at TIMESTAMP NOT NULL,
    activated BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE IF NOT EXISTS member_stamp
(
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    region_id BIGINT NOT NULL,
    achieved_at TIMESTAMP NOT NULL
);
