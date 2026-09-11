-- ==========================================
-- IncheonGuro 코스 안내 초기 데이터
--
-- 코스 안내 페이지(추천/목록/상세)에서 사용할
-- 샘플 코스 데이터를 등록하기 위한 SQL 파일입니다.
-- 프론트엔드 mock 데이터(courseguide.ts, courseRoute.ts)를 그대로 반영했습니다.
--
-- 총 10개 코스 (그 중 5개는 추천 코스)
--
-- 주의:
-- 재실행해도 안전하도록 맨 앞에서 기존 데이터를 전부 삭제(TRUNCATE)한 뒤
-- 다시 넣습니다. 즉 이 파일을 몇 번을 실행해도 중복되지 않습니다.
-- ==========================================


-- ==========================================
-- 0. 기존 데이터 초기화 (재실행 대비)
-- ==========================================

TRUNCATE TABLE course_segment, course_place, bookmark, course RESTART IDENTITY CASCADE;


-- ==========================================
-- 1. course (코스 기본 정보, 순서대로 id 1~10 부여됨)
-- 앞 5개(1~5)는 is_recommended = true
-- ==========================================

INSERT INTO course (name, description, is_recommended)
VALUES
    ('청라 호수공원 산책 코스', '청라국제도시의 호수와 공원을 여유롭게 둘러보는 코스입니다.', true),
    ('송도 센트럴파크 나들이', '송도국제도시의 랜드마크와 공원을 함께 즐기는 코스입니다.', true),
    ('차이나타운 문화 탐방', '이국적인 거리와 근대 문화유산을 함께 둘러보는 코스입니다.', true),
    ('소래포구 미식 여행', '싱싱한 해산물과 갯벌 풍경을 함께 즐기는 코스입니다.', true),
    ('월미도 바다 여행', '바다를 배경으로 놀이시설과 거리를 즐기는 코스입니다.', true),
    ('강화도 역사 탐방', '고려산과 강화역사관을 함께 둘러보는 역사 여행 코스입니다.', false),
    ('을왕리 해변 드라이브', '서해 낙조와 해변 산책을 즐길 수 있는 드라이브 코스입니다.', false),
    ('구월동 로데오거리 쇼핑', '트렌디한 카페와 쇼핑거리를 즐기는 도심 나들이 코스입니다.', false),
    ('영종도 하늘 산책', '공항 주변 자연과 전망대를 함께 즐기는 코스입니다.', false),
    ('부평 문화의거리 탐방', '젊음의 거리와 지하상가를 함께 둘러보는 도심 코스입니다.', false);


-- ==========================================
-- 2. course_place (코스별 장소, 순서 포함)
-- ==========================================

INSERT INTO course_place (course_id, name, address, order_index)
SELECT id, '청라호수공원', '인천 서구 청라동', 0 FROM course WHERE name = '청라 호수공원 산책 코스'
UNION ALL SELECT id, '커널웨이', '인천 서구 청라커널로', 1 FROM course WHERE name = '청라 호수공원 산책 코스'
UNION ALL SELECT id, '청라시티타워', '인천 서구 로봇랜드로', 2 FROM course WHERE name = '청라 호수공원 산책 코스'
UNION ALL SELECT id, '청라국제업무단지', '인천 서구 로봇랜드로', 3 FROM course WHERE name = '청라 호수공원 산책 코스'

UNION ALL SELECT id, '센트럴파크', '인천 연수구 컨벤시아대로', 0 FROM course WHERE name = '송도 센트럴파크 나들이'
UNION ALL SELECT id, '트리플스트리트', '인천 연수구 송도과학로', 1 FROM course WHERE name = '송도 센트럴파크 나들이'
UNION ALL SELECT id, '인천대교 전망대', '인천 연수구 아암대로', 2 FROM course WHERE name = '송도 센트럴파크 나들이'
UNION ALL SELECT id, '송도국제도시홍보관', '인천 연수구 컨벤시아대로', 3 FROM course WHERE name = '송도 센트럴파크 나들이'
UNION ALL SELECT id, '달빛축제공원', '인천 연수구 컨벤시아대로', 4 FROM course WHERE name = '송도 센트럴파크 나들이'

UNION ALL SELECT id, '인천차이나타운', '인천 중구 차이나타운로', 0 FROM course WHERE name = '차이나타운 문화 탐방'
UNION ALL SELECT id, '자유공원', '인천 중구 응봉산길', 1 FROM course WHERE name = '차이나타운 문화 탐방'
UNION ALL SELECT id, '신포국제시장', '인천 중구 신포로', 2 FROM course WHERE name = '차이나타운 문화 탐방'

UNION ALL SELECT id, '소래포구', '인천 남동구 소래포구로', 0 FROM course WHERE name = '소래포구 미식 여행'
UNION ALL SELECT id, '소래습지생태공원', '인천 남동구 논현동', 1 FROM course WHERE name = '소래포구 미식 여행'
UNION ALL SELECT id, '소래철교', '인천 남동구 소래역로', 2 FROM course WHERE name = '소래포구 미식 여행'

UNION ALL SELECT id, '월미테마파크', '인천 중구 월미문화로', 0 FROM course WHERE name = '월미도 바다 여행'
UNION ALL SELECT id, '월미바다열차', '인천 중구 월미로', 1 FROM course WHERE name = '월미도 바다 여행'
UNION ALL SELECT id, '월미문화의거리', '인천 중구 월미문화의거리', 2 FROM course WHERE name = '월미도 바다 여행'

UNION ALL SELECT id, '강화역사박물관', '인천 강화군 하점면', 0 FROM course WHERE name = '강화도 역사 탐방'
UNION ALL SELECT id, '고려산', '인천 강화군 강화읍', 1 FROM course WHERE name = '강화도 역사 탐방'
UNION ALL SELECT id, '전등사', '인천 강화군 길상면', 2 FROM course WHERE name = '강화도 역사 탐방'

UNION ALL SELECT id, '을왕리해수욕장', '인천 중구 을왕동', 0 FROM course WHERE name = '을왕리 해변 드라이브'
UNION ALL SELECT id, '왕산해수욕장', '인천 중구 을왕동', 1 FROM course WHERE name = '을왕리 해변 드라이브'
UNION ALL SELECT id, '마시란해변', '인천 중구 마시란로', 2 FROM course WHERE name = '을왕리 해변 드라이브'

UNION ALL SELECT id, '구월동로데오거리', '인천 남동구 구월동', 0 FROM course WHERE name = '구월동 로데오거리 쇼핑'
UNION ALL SELECT id, '인천시청', '인천 남동구 정각로', 1 FROM course WHERE name = '구월동 로데오거리 쇼핑'
UNION ALL SELECT id, '인천종합문화예술회관', '인천 남동구 예술로', 2 FROM course WHERE name = '구월동 로데오거리 쇼핑'

UNION ALL SELECT id, '영종해변공원', '인천 중구 운서동', 0 FROM course WHERE name = '영종도 하늘 산책'
UNION ALL SELECT id, '왕산마리나', '인천 중구 왕산해안북로', 1 FROM course WHERE name = '영종도 하늘 산책'
UNION ALL SELECT id, '인천공항전망대', '인천 중구 공항로', 2 FROM course WHERE name = '영종도 하늘 산책'

UNION ALL SELECT id, '부평문화의거리', '인천 부평구 부평동', 0 FROM course WHERE name = '부평 문화의거리 탐방'
UNION ALL SELECT id, '부평역지하상가', '인천 부평구 부평대로', 1 FROM course WHERE name = '부평 문화의거리 탐방'
UNION ALL SELECT id, '부평공원', '인천 부평구 부흥로', 2 FROM course WHERE name = '부평 문화의거리 탐방';


-- ==========================================
-- 3. course_segment (장소 사이 이동구간, 이동수단별)
-- mock의 buildRouteForMode 계산식(거리=300+idx*150, 시간=(5+idx*3)*배수)을 그대로 SQL로 재현.
-- 마지막 장소 다음에는 구간이 없으므로, 코스별 최대 order_index 미만인 장소들만 대상으로 함.
-- ==========================================

INSERT INTO course_segment (course_id, transport_mode, order_index, distance, duration)
SELECT
    cp.course_id,
    m.transport_mode,
    cp.order_index,
    (300 + cp.order_index * 150)::text || 'm' AS distance,
    ROUND(
        (5 + cp.order_index * 3) *
        CASE m.transport_mode
            WHEN 'WALK' THEN 1
            WHEN 'TRANSIT' THEN 0.4
            WHEN 'BIKE' THEN 0.5
            WHEN 'CAR' THEN 0.25
        END
    )::int::text || '분' AS duration
FROM course_place cp
CROSS JOIN (VALUES ('WALK'), ('TRANSIT'), ('BIKE'), ('CAR')) AS m(transport_mode)
WHERE cp.order_index < (
    SELECT MAX(order_index) FROM course_place cp2 WHERE cp2.course_id = cp.course_id
);
