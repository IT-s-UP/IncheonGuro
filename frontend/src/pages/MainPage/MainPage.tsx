import { useMemo, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowRight } from 'lucide-react';

import { useAuth } from '@/auth/AuthContext';
import { apiFetch } from '@/auth/api'; // [추가] 마이페이지 API 호출용

import Header from '@/components/Header/Header';

import OptionTab from '@/components/Tab/OptionTab';

import Typography from '@/components/Typography/Typography';

import mainHero from '@/assets/main-hero.png';

import { getCourses } from '@/api/courseGuide';
import type { CourseSummary } from '@/api/courseGuide';

import { ImageOff } from 'lucide-react';

// [추가] 실제 장소 API 함수/타입 호출
import { getPlaces } from '@/api/placeGuide';
import type { District, PlaceSummary } from '@/api/placeGuide';

import { COURSE_CARDS, RECOMMENDED_REGIONS, REGION_CARDS, SPOT_CARDS } from './mockData';

import './MainPage.css';

// [추가] 한글 지역명 -> District enum 매핑
// (mypage의 interestedRegionName과 placeguide의 District가 서로 다른 시스템이라 이름 문자열로만 매핑 가능)
const REGION_NAME_TO_DISTRICT: Record<string, District> = {
  제물포구: 'JEMULPO',
  영종구: 'YEONGJONG',
  서해구: 'SEOHAE',
  검단구: 'GEOMDAN',
  계양구: 'GYEYANG',
  부평구: 'BUPYEONG',
  미추홀구: 'MICHUHOL',
  남동구: 'NAMDONG',
  연수구: 'YEONSU',
  강화군: 'GANGHWA',
  옹진군: 'ONGJIN',
};

// [추가] 로그인 안 했거나 관심 지역 미설정일 때 기본으로 보여줄 지역
const DEFAULT_REGION_NAME = '서해구';

// [추가] /api/mypage 응답 중 지금 필요한 필드만
interface MyPageApiData {
  interestedRegionName: string | null;
}

/* =========================
   MainPage
========================= */

function formatShortAddress(fullAddress: string) {
  return fullAddress.split(' ').slice(0, 2).join(' ');
}

const SPOT_NAME_MAX_LENGTH = 7;

function truncateSpotName(name: string) {
  if (name.length <= SPOT_NAME_MAX_LENGTH) {
    return name;
  }
  return `${name.slice(0, SPOT_NAME_MAX_LENGTH)}...`;
}

// [추가] 문자열을 숫자 해시값으로 변환 (날짜 기준 결정적 랜덤 선택에 사용)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // 32비트 정수로 유지
  }
  return hash;
}

// [추가] 목록에서 매일 같은 3개(오늘 하루 동안은 고정, 날짜 바뀌면 다른 3개)를 뽑는 함수
function pickDailyItems<T>(items: T[], count: number, keyOf: (item: T) => string): T[] {
  const todayString = new Date().toISOString().slice(0, 10); // 예: "2026-09-16"

  return [...items]
    .sort((a, b) => simpleHash(keyOf(a) + todayString) - simpleHash(keyOf(b) + todayString))
    .slice(0, count);
}

function MainPage() {
  const navigate = useNavigate();

  /* =========================
     사용자 닉네임

     비로그인 상태에서는
     게스트 문구로 대체
  ========================= */

  const { user } = useAuth();

  const nickname = user?.nickname ?? '게스트';

  /* =========================
     추천 지역 탭
  ========================= */

  const [activeRegionIndex, setActiveRegionIndex] = useState(0);

  const activeRegion = RECOMMENDED_REGIONS[activeRegionIndex];

  const [regionName, setRegionName] = useState(DEFAULT_REGION_NAME); // [추가]

  useEffect(() => {
    // [추가] 비로그인이면 기본값(DEFAULT_REGION_NAME) 유지, API 호출 안 함
    if (!user) return;

    let cancelled = false;

    apiFetch('/api/mypage')
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { data: MyPageApiData } | null) => {
        if (cancelled || !body) return;

        if (body.data.interestedRegionName) {
          setRegionName(body.data.interestedRegionName);
        }
      })
      .catch(() => {
        // 실패해도 기본값으로 계속 진행
      });

    return () => {
      cancelled = true;
    };
  }, [user]); // [추가] 전체 useEffect 블록

  /* =========================
     선택한 지역 추천 장소
  ========================= */
  const [spots, setSpots] = useState<PlaceSummary[]>([]); // [추가]
  const [isSpotsLoading, setIsSpotsLoading] = useState(true); // [추가]

  // const filteredSpots = useMemo(() => {
  //   return SPOT_CARDS.filter((spot) => spot.region === activeRegion);
  // }, [activeRegion]);

  useEffect(() => {
    const district = REGION_NAME_TO_DISTRICT[regionName];

    if (!district) {
      setSpots([]);
      setIsSpotsLoading(false);
      return;
    }

    let cancelled = false;
    setIsSpotsLoading(true);

    getPlaces([district], ['ATTRACTION'])
      .then((data) => {
        if (!cancelled) {
          setSpots(data.slice(0, 6)); // 메인 화면엔 최대 6개만
        }
      })
      .catch((error) => {
        console.error('추천 장소 조회 실패:', error);
        if (!cancelled) setSpots([]);
      })
      .finally(() => {
        if (!cancelled) setIsSpotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [regionName]); // [추가] 전체 useEffect 블록

  /* =========================
     인천 전체 장소
  ========================= */

  const handleHeroClick = () => {
    navigate('/place-guide'); // [수정] '/places' -> 실제 라우트 '/place-guide'
  };

  /* =========================
     장소 상세
  ========================= */

  // const handleSpotClick = (spotId: number) => {
  //   navigate(`/places/${spotId}`);
  // };

  // [수정] spotId: number -> placeId: string (관광공사 contentId는 문자열)
  const handleSpotClick = (placeId: string) => {
    navigate(`/place-guide/${placeId}`); // [수정] '/places/...' -> 실제 라우트 '/place-guide/...'
  };

  /* =========================
     지역별 장소
  ========================= */

  // const handleRegionClick = (regionName: string) => {
  //   navigate(`/places?region=${encodeURIComponent(regionName)}`);
  // };

  const handleRegionClick = (regionCardName: string) => {
    // [수정] 한글 지역명을 District enum으로 변환해서 실제 쿼리 파라미터로 사용
    const district = REGION_NAME_TO_DISTRICT[regionCardName];
    if (district) {
      navigate(`/place-guide?districts=${district}`); // [수정] '/places?region=...' -> 실제 라우트+쿼리
    }
  };

  /* =========================
     추천 코스 상세
  ========================= */

  const handleCourseClick = (courseId: string) => {
    navigate(`/course-guide/${courseId}`);
  };

  // [추가] 추천 코스 - 관광공사 전체 코스 중 오늘 날짜 기준 고정 3개
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getCourses()
      .then((data) => {
        if (!cancelled) {
          setCourses(pickDailyItems(data, 3, (course) => course.courseId));
        }
      })
      .catch((error) => {
        console.error('코스 목록 조회 실패:', error);
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setIsCoursesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // [추가] 전체 useEffect 블록

  return (
    <div className="main-page">
      <Header />

      <main className="main-page__content">
        {/* =========================
            메인 배너
        ========================= */}

        <button type="button" className="main-page__hero" onClick={handleHeroClick}>
          <div className="main-page__hero-text">
            <Typography as="h1" variant="head1">
              요즘 떠오르는
            </Typography>

            <Typography as="p" variant="head1">
              인천 장소를
            </Typography>

            <div className="main-page__hero-last-line">
              <Typography as="p" variant="head1">
                알아볼까요?
              </Typography>

              <span className="main-page__hero-arrow">
                <ArrowRight size={25} strokeWidth={3} />
              </span>
            </div>
          </div>

          <img src={mainHero} alt="" className="main-page__hero-image" />
        </button>

        {/* =========================
            추천 장소
        ========================= */}

        <section className="main-page__spots">
          <Typography as="h2" variant="head2" className="main-page__section-title">
            {nickname} 님의 취향을 반영한 추천 장소
          </Typography>

          {/* =========================
              [연동 수정] 추천 지역 OptionTab -> 관심 지역 단일 라벨
              기존: RECOMMENDED_REGIONS.map으로 OptionTab 여러 개 렌더링
              변경: regionName 하나만 표시 (더 이상 탭 아님)
          ========================= */}

          <div className="main-page__region-tabs">
            <span className="main-page__region-label">{regionName}</span>
            {/* [연동 삭제]
            {RECOMMENDED_REGIONS.map((region, index) => (
              <OptionTab
                key={region}
                label={region}
                size="small"
                active={index === activeRegionIndex}
                onClick={() => setActiveRegionIndex(index)}
              />
            ))}
            */}
          </div>

          {/* =========================
              [수정] 추천 장소 카드
              기존: filteredSpots(mock) 렌더링
              변경: spots(실제 API 결과) 렌더링 + 로딩/빈 상태 처리 추가
          ========================= */}

          {isSpotsLoading ? ( // [추가] 로딩 상태 처리
            <p style={{ padding: '0 20px', color: '#828585' }}>불러오는 중...</p>
          ) : spots.length === 0 ? ( // [추가] 빈 결과 처리
            <p style={{ padding: '0 20px', color: '#828585' }}>추천 장소가 없습니다.</p>
          ) : (
            <ul className="main-page__spot-list">
              {spots.map((spot) => (
                // 수정] filteredSpots -> spots
                <li key={spot.placeId} className="main-page__spot-item">
                  {' '}
                  {/* [수정] spot.id -> spot.placeId */}
                  <button
                    type="button"
                    className="main-page__spot-card"
                    onClick={() => handleSpotClick(spot.placeId)} // [수정] spot.id -> spot.placeId
                  >
                    {/* 이미지 */}

                    {spot.imageUrl ? (
                      <img
                        src={spot.imageUrl}
                        alt={spot.title} // [수정] spot.name -> spot.title
                        className="main-page__spot-image"
                      />
                    ) : (
                      <div className="main-page__spot-placeholder">
                        <ImageOff size={28} color="#c4c4c4" strokeWidth={1.5} />
                        <Typography variant="p3" color="#a0a0a0">
                          이미지 준비 중
                        </Typography>
                      </div>
                    )}

                    {/* 이미지 아래쪽 어둡게 */}

                    <div className="main-page__spot-overlay" />

                    {/* 장소 이름 */}

                    <Typography variant="head3" color="#ffffff" className="main-page__spot-name">
                      {truncateSpotName(spot.title)} {/* [수정] spot.name -> spot.title */}
                    </Typography>

                    {/* 장소 종류 */}

                    <span className="main-page__spot-tag">
                      <Typography variant="p3">{formatShortAddress(spot.subtitle)}</Typography>
                      {/* [수정] spot.tag -> spot.subtitle (백엔드에 카테고리 태그 대신 주소만 있음) */}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* =========================
            인천의 모든 장소
        ========================= */}

        <section className="main-page__regions">
          <Typography as="h2" variant="head2" className="main-page__section-title">
            인천의 모든 장소들
          </Typography>

          <ul className="main-page__region-list">
            {REGION_CARDS.map((region) => (
              <li key={region.id} className="main-page__region-item">
                <button
                  type="button"
                  className="main-page__region-card"
                  onClick={() => handleRegionClick(region.name)}
                >
                  {/* 지역 이름 */}

                  <Typography variant="head3" className="main-page__region-name">
                    {region.name}
                  </Typography>

                  {/* 마스코트 */}

                  <div className="main-page__region-mascot">
                    {region.mascotUrl ? (
                      <img
                        src={region.mascotUrl}
                        alt={`${region.name} 마스코트`}
                        className="main-page__region-mascot-image"
                      />
                    ) : (
                      <Typography
                        variant="p3"
                        color="#828585"
                        className="main-page__region-mascot-placeholder"
                      >
                        마스코트
                      </Typography>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* =========================
            사용자 추천 코스
        ========================= */}

        <section className="main-page__courses">
          <Typography as="h2" variant="head2" className="main-page__section-title">
            {nickname} 님의 취향을 반영한 추천 코스
          </Typography>

          {isCoursesLoading ? ( // [추가] 로딩 상태 처리
            <p style={{ padding: '0 20px', color: '#828585' }}>불러오는 중...</p>
          ) : courses.length === 0 ? ( // [추가] 빈 결과 처리
            <p style={{ padding: '0 20px', color: '#828585' }}>추천 코스가 없습니다.</p>
          ) : (
            <ul className="main-page__course-list">
              {courses.map((course) => (
                // [수정] COURSE_CARDS -> courses
                <li key={course.courseId} className="main-page__course-item">
                  {' '}
                  {/* [수정] course.id -> course.courseId */}
                  <button
                    type="button"
                    className="main-page__course-card"
                    onClick={() => handleCourseClick(course.courseId)} // [수정] course.id -> course.courseId
                  >
                    {/* 코스 이미지 - CourseSummary엔 imageUrl 필드가 없어서 항상 placeholder */}
                    {/* [수정] course.imageUrl 조건 제거, 항상 placeholder 표시 */}+{' '}
                    {/* [수정] imageUrl 필드가 백엔드에 추가되어 다시 조건부 렌더링 */}
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="main-page__course-image"
                      />
                    ) : (
                      <div className="main-page__course-placeholder">
                        <Typography variant="p3" color="#828585">
                          코스 대표 이미지
                        </Typography>
                      </div>
                    )}
                    {/* Gradient */}
                    <div className="main-page__course-overlay" />
                    {/* 코스 이름 */}
                    <Typography variant="head3" color="#ffffff" className="main-page__course-name">
                      {course.name}
                    </Typography>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default MainPage;
