import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ImageOff } from 'lucide-react';

import { useAuth } from '@/auth/AuthContext';
import { apiFetch } from '@/auth/api';

import Header from '@/components/Header/Header';
import Typography from '@/components/Typography/Typography';
import OptionTab from '@/components/Tab/OptionTab';

import mainHero from '@/assets/main-hero.png';

import { getCourses } from '@/api/courseGuide';
import type { CourseSummary } from '@/api/courseGuide';

import { getPlaces } from '@/api/placeGuide';
import type { District, PlaceSummary } from '@/api/placeGuide';

import { REGION_CARDS } from './mockData';

import './MainPage.css';

/* =========================================================
   지역명 → District enum
========================================================= */

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

const DEFAULT_REGION_NAME = '서해구';

/* =========================================================
   마이페이지 API 응답
========================================================= */

interface MyPageApiData {
  interestedRegionName: string | null;
}

/* =========================================================
   GUMBTI 추천 지역 API 응답
========================================================= */

interface RecommendedRegionResponse {
  regionId: number | null;
  regionName: string | null;
}

/* =========================================================
   장소 카테고리 한글 변환
========================================================= */

function toKoreanCategoryTag(category: string) {
  const labels: Record<string, string> = {
    ATTRACTION: '관광지',
    CAFE: '카페',
    RESTAURANT: '식당',
    LODGING: '숙소',
    SHOPPING: '쇼핑',
    CULTURE: '문화시설',
    LEISURE: '레포츠',
  };

  return labels[category] ?? category;
}

/* =========================================================
   장소 이름 길이 제한
========================================================= */

const SPOT_NAME_MAX_LENGTH = 7;

function truncateSpotName(name: string) {
  if (name.length <= SPOT_NAME_MAX_LENGTH) {
    return name;
  }

  return `${name.slice(0, SPOT_NAME_MAX_LENGTH)}...`;
}

/* =========================================================
   날짜 기준 랜덤 선택
========================================================= */

function simpleHash(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  return hash;
}

function pickDailyItems<T>(items: T[], count: number, keyOf: (item: T) => string): T[] {
  const todayString = new Date().toISOString().slice(0, 10);

  return [...items]
    .sort((a, b) => simpleHash(keyOf(a) + todayString) - simpleHash(keyOf(b) + todayString))
    .slice(0, count);
}

/* =========================================================
   MainPage
========================================================= */

function MainPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const nickname = user?.nickname ?? '게스트';

  /* =========================================================
     관심 지역
  ========================================================= */

  const [interestedRegionName, setInterestedRegionName] = useState(DEFAULT_REGION_NAME);

  /* =========================================================
     GUMBTI 추천 지역
  ========================================================= */

  const [recommendedRegionName, setRecommendedRegionName] = useState<string | null>(null);

  /* =========================================================
     현재 선택된 지역
  ========================================================= */

  const [selectedRegionName, setSelectedRegionName] = useState(DEFAULT_REGION_NAME);

  /* =========================================================
     관심 지역 조회
  ========================================================= */

  useEffect(() => {
    if (!user) {
      setInterestedRegionName(DEFAULT_REGION_NAME);
      setSelectedRegionName(DEFAULT_REGION_NAME);
      return;
    }

    let cancelled = false;

    apiFetch('/api/mypage')
      .then((response) => {
        if (!response.ok) {
          return null;
        }

        return response.json();
      })
      .then((body: { data: MyPageApiData } | null) => {
        if (cancelled || !body) {
          return;
        }

        const regionName = body.data.interestedRegionName ?? DEFAULT_REGION_NAME;

        setInterestedRegionName(regionName);

        /*
         * 처음 들어왔을 때는
         * 사용자의 관심 지역을 기본 선택
         */
        setSelectedRegionName((current) => {
          if (!current || current === DEFAULT_REGION_NAME) {
            return regionName;
          }

          return current;
        });
      })
      .catch((error) => {
        console.error('관심 지역 조회 실패:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* =========================================================
     GUMBTI 추천 지역 조회
  ========================================================= */

  useEffect(() => {
    /*
     * 로그인하지 않은 경우
     * GUMBTI 추천 지역을 조회하지 않음
     */
    if (!user) {
      setRecommendedRegionName(null);
      return;
    }

    let cancelled = false;

    apiFetch('/api/region/recommended')
      .then((response) => {
        if (!response.ok) {
          return null;
        }

        return response.json();
      })
      .then((data: RecommendedRegionResponse | null) => {
        if (cancelled || !data) {
          return;
        }

        /*
         * GUMBTI 추천 지역이 없으면
         * 추천 탭을 만들지 않음
         */
        if (!data.regionName) {
          setRecommendedRegionName(null);
          return;
        }

        /*
         * 관심 지역과 동일한 경우
         * 중복 탭을 만들지 않음
         */
        if (data.regionName === interestedRegionName) {
          setRecommendedRegionName(null);
          return;
        }

        setRecommendedRegionName(data.regionName);
      })
      .catch((error) => {
        console.error('GUMBTI 추천 지역 조회 실패:', error);

        if (!cancelled) {
          setRecommendedRegionName(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, interestedRegionName]);

  /* =========================================================
     추천 지역 탭 표시 여부
  ========================================================= */

  const hasRecommendedRegion =
    recommendedRegionName !== null && recommendedRegionName !== interestedRegionName;

  /* =========================================================
     현재 선택 지역의 장소
  ========================================================= */

  const [spots, setSpots] = useState<PlaceSummary[]>([]);
  const [isSpotsLoading, setIsSpotsLoading] = useState(true);

  useEffect(() => {
    const district = REGION_NAME_TO_DISTRICT[selectedRegionName];

    if (!district) {
      setSpots([]);
      setIsSpotsLoading(false);
      return;
    }

    let cancelled = false;

    setIsSpotsLoading(true);

    getPlaces([district])
      .then((data) => {
        if (cancelled) {
          return;
        }

        const shuffled = [...data].sort(() => Math.random() - 0.5);

        setSpots(shuffled.slice(0, 6));
      })
      .catch((error) => {
        console.error('추천 장소 조회 실패:', error);

        if (!cancelled) {
          setSpots([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsSpotsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRegionName]);

  /* =========================================================
     메인 배너
  ========================================================= */

  const handleHeroClick = () => {
    navigate('/place-guide');
  };

  /* =========================================================
     장소 상세
  ========================================================= */

  const handleSpotClick = (placeId: string) => {
    navigate(`/place-guide/${placeId}`);
  };

  /* =========================================================
     지역 전체 보기
  ========================================================= */

  const handleRegionClick = (regionCardName: string) => {
    const district = REGION_NAME_TO_DISTRICT[regionCardName];

    if (district) {
      navigate(`/place-guide?districts=${district}`);
    }
  };

  /* =========================================================
     추천 코스
  ========================================================= */

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

        if (!cancelled) {
          setCourses([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCoursesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/course-guide/${courseId}`);
  };

  /* =========================================================
     화면
  ========================================================= */

  return (
    <div className="main-page">
      <Header />

      <main className="main-page__content">
        {/* =====================================================
            메인 배너
        ===================================================== */}

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

        {/* =====================================================
            추천 장소
        ===================================================== */}

        <section className="main-page__spots">
          <Typography as="h2" variant="head2" className="main-page__section-title">
            {nickname} 님의 취향을 반영한 추천 장소
          </Typography>

          {/* =================================================
              지역 탭
          ================================================= */}

          <div className="main-page__region-tabs">
            {/* 관심 지역 탭 */}
            <OptionTab
              label={interestedRegionName}
              size="small"
              active={selectedRegionName === interestedRegionName}
              onClick={() => setSelectedRegionName(interestedRegionName)}
            />

            {/* GUMBTI 추천 지역 탭 */}
            {hasRecommendedRegion && recommendedRegionName && (
              <OptionTab
                label={recommendedRegionName}
                size="small"
                active={selectedRegionName === recommendedRegionName}
                onClick={() => setSelectedRegionName(recommendedRegionName)}
              />
            )}
          </div>

          {/* =================================================
              선택된 지역의 장소
          ================================================= */}

          {isSpotsLoading ? (
            <p
              style={{
                padding: '0 20px',
                color: '#828585',
              }}
            >
              불러오는 중...
            </p>
          ) : spots.length === 0 ? (
            <p
              style={{
                padding: '0 20px',
                color: '#828585',
              }}
            >
              추천 장소가 없습니다.
            </p>
          ) : (
            <ul className="main-page__spot-list">
              {spots.map((spot) => (
                <li key={spot.placeId} className="main-page__spot-item">
                  <button
                    type="button"
                    className="main-page__spot-card"
                    onClick={() => handleSpotClick(spot.placeId)}
                  >
                    {spot.imageUrl ? (
                      <img src={spot.imageUrl} alt={spot.title} className="main-page__spot-image" />
                    ) : (
                      <div className="main-page__spot-placeholder">
                        <ImageOff size={28} color="#c4c4c4" strokeWidth={1.5} />

                        <Typography variant="p3" color="#a0a0a0">
                          이미지 준비 중
                        </Typography>
                      </div>
                    )}

                    <div className="main-page__spot-overlay" />

                    <Typography variant="head3" color="#ffffff" className="main-page__spot-name">
                      {truncateSpotName(spot.title)}
                    </Typography>

                    <span className="main-page__spot-tag">
                      <Typography variant="p3">{toKoreanCategoryTag(spot.category)}</Typography>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* =====================================================
            인천의 모든 장소
        ===================================================== */}

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
                  <Typography variant="head3" className="main-page__region-name">
                    {region.name}
                  </Typography>

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

        {/* =====================================================
            추천 코스
        ===================================================== */}

        <section className="main-page__courses">
          <Typography as="h2" variant="head2" className="main-page__section-title">
            {nickname} 님의 취향을 반영한 추천 코스
          </Typography>

          {isCoursesLoading ? (
            <p
              style={{
                padding: '0 20px',
                color: '#828585',
              }}
            >
              불러오는 중...
            </p>
          ) : courses.length === 0 ? (
            <p
              style={{
                padding: '0 20px',
                color: '#828585',
              }}
            >
              추천 코스가 없습니다.
            </p>
          ) : (
            <ul className="main-page__course-list">
              {courses.map((course) => (
                <li key={course.courseId} className="main-page__course-item">
                  <button
                    type="button"
                    className="main-page__course-card"
                    onClick={() => handleCourseClick(course.courseId)}
                  >
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

                    <div className="main-page__course-overlay" />

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
