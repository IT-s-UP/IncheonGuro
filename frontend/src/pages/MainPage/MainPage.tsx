import { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArrowRight } from 'lucide-react';

import { useAuth } from '@/auth/AuthContext';

import Header from '@/components/Header/Header';

import OptionTab from '@/components/Tab/OptionTab';

import Typography from '@/components/Typography/Typography';

import mainHero from '@/assets/main-hero.png';

import { COURSE_CARDS, RECOMMENDED_REGIONS, REGION_CARDS, SPOT_CARDS } from './mockData';

import './MainPage.css';

/* =========================
   MainPage
========================= */

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

  /* =========================
     선택한 지역 추천 장소
  ========================= */

  const filteredSpots = useMemo(() => {
    return SPOT_CARDS.filter((spot) => spot.region === activeRegion);
  }, [activeRegion]);

  /* =========================
     인천 전체 장소
  ========================= */

  const handleHeroClick = () => {
    navigate('/places');
  };

  /* =========================
     장소 상세
  ========================= */

  const handleSpotClick = (spotId: number) => {
    navigate(`/places/${spotId}`);
  };

  /* =========================
     지역별 장소
  ========================= */

  const handleRegionClick = (regionName: string) => {
    navigate(`/places?region=${encodeURIComponent(regionName)}`);
  };

  /* =========================
     추천 코스 상세
  ========================= */

  const handleCourseClick = (courseId: number) => {
    navigate(`/course-guide/${courseId}`);
  };

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
              추천 지역 OptionTab
          ========================= */}

          <div className="main-page__region-tabs">
            {RECOMMENDED_REGIONS.map((region, index) => (
              <OptionTab
                key={region}
                label={region}
                size="small"
                active={index === activeRegionIndex}
                onClick={() => setActiveRegionIndex(index)}
              />
            ))}
          </div>

          {/* =========================
              추천 장소 카드
          ========================= */}

          <ul className="main-page__spot-list">
            {filteredSpots.map((spot) => (
              <li key={spot.id} className="main-page__spot-item">
                <button
                  type="button"
                  className="main-page__spot-card"
                  onClick={() => handleSpotClick(spot.id)}
                >
                  {/* 이미지 */}

                  {spot.imageUrl ? (
                    <img src={spot.imageUrl} alt={spot.name} className="main-page__spot-image" />
                  ) : (
                    <div className="main-page__spot-placeholder">
                      <Typography variant="p3" color="#828585">
                        장소 이미지
                      </Typography>
                    </div>
                  )}

                  {/* 이미지 아래쪽 어둡게 */}

                  <div className="main-page__spot-overlay" />

                  {/* 장소 이름 */}

                  <Typography variant="head3" color="#ffffff" className="main-page__spot-name">
                    {spot.name}
                  </Typography>

                  {/* 장소 종류 */}

                  <span className="main-page__spot-tag">
                    <Typography variant="p3">{spot.tag}</Typography>
                  </span>
                </button>
              </li>
            ))}
          </ul>
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

          <ul className="main-page__course-list">
            {COURSE_CARDS.map((course) => (
              <li key={course.id} className="main-page__course-item">
                <button
                  type="button"
                  className="main-page__course-card"
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* 코스 이미지 */}

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
        </section>
      </main>
    </div>
  );
}

export default MainPage;
