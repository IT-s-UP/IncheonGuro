import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Button from '@/components/Button/Button';
import OptionTab from '@/components/Tab/OptionTab';
import Typography from '@/components/Typography/Typography';

import RegionRecommendIntro from '@/assets/RegionRecommendIntro.png';
import RegionRecommendLoading1 from '@/assets/RegionRecommendLoading1.png';
import RegionRecommendLoading2 from '@/assets/RegionRecommendLoading2.png';

/* =========================
   지역 추천 결과 이미지
========================= */

import GanghwaRecommend from '@/assets/RegionRecommend/강화군 추천.png';
import GeomdanRecommend from '@/assets/RegionRecommend/검단구 추천.png';
import GyeyangRecommend from '@/assets/RegionRecommend/계양구 추천.png';
import NamdongRecommend from '@/assets/RegionRecommend/남동구 추천.png';
import MichuholRecommend from '@/assets/RegionRecommend/미추홀구 추천.png';
import BupyeongRecommend from '@/assets/RegionRecommend/부평구 추천.png';
import SeohaeRecommend from '@/assets/RegionRecommend/서해구 추천.png';
import YeonsuRecommend from '@/assets/RegionRecommend/연수구 추천.png';
import YeongjongRecommend from '@/assets/RegionRecommend/영종구 추천.png';
import OngjinRecommend from '@/assets/RegionRecommend/옹진군 추천.png';
import JemulpoRecommend from '@/assets/RegionRecommend/제물포구 추천.png';

import { apiFetch } from '@/auth/api';
import { useAuth } from '@/auth/AuthContext';

import './RegionRecommendPage.css';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/* =========================
   선택지
========================= */

const PLACE_OPTIONS = [
  '해변 / 섬',
  '공원 / 자연',
  '카페 / 핫플',
  '시장 / 골목',
  '전시 / 문화 공간',
  '쇼핑몰 / 번화가',
  '맛집 / 먹자골목',
  '유적지 / 역사명소',
];

const MOVE_OPTIONS = ['많이 걸어도 괜찮다', '대중교통 위주', '자차 위주', '이동은 최소화'];

const MOOD_OPTIONS = [
  '바다 / 자연',
  '감성 / 힐링',
  '역사 / 문화',
  '맛집 / 먹방',
  '액티비티 / 체험',
  '쇼핑 / 핫플레이스',
  '도심 / 야경',
  '레트로 / 빈티지',
];

const COMPANION_OPTIONS = ['혼자', '연인', '친구', '가족'];

/* =========================
   지역명 → District enum
========================= */

const REGION_TO_DISTRICT: Record<string, string> = {
  제물포구: 'JEMULPO',
  영종구: 'YEONGJONG',
  미추홀구: 'MICHUHOL',
  연수구: 'YEONSU',
  남동구: 'NAMDONG',
  부평구: 'BUPYEONG',
  계양구: 'GYEYANG',
  서해구: 'SEOHAE',
  검단구: 'GEOMDAN',
  강화군: 'GANGHWA',
  옹진군: 'ONGJIN',
};

/* =========================
   지역명 → 결과 이미지
========================= */

const REGION_IMAGE_MAP: Record<string, string> = {
  강화군: GanghwaRecommend,
  검단구: GeomdanRecommend,
  계양구: GyeyangRecommend,
  남동구: NamdongRecommend,
  미추홀구: MichuholRecommend,
  부평구: BupyeongRecommend,
  서해구: SeohaeRecommend,
  연수구: YeonsuRecommend,
  영종구: YeongjongRecommend,
  옹진군: OngjinRecommend,
  제물포구: JemulpoRecommend,
};

/* =========================
   지역 추천 API 응답
========================= */

type RegionRecommendResponse = {
  regionName: string;
  description: string;
  imageUrl: string;
  score: number;
};

/* =========================
   장소 API 응답
========================= */

type PlaceSummaryResponse = {
  placeId: string;
  title: string;
  subtitle: string;
  district: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  lclsSystm2: string;
};

/* =========================
   추천 장소
========================= */

type RecommendedPlace = {
  id: string;
  name: string;
  imageUrl: string;
};

/* =========================
   최종 결과
========================= */

type RegionResult = {
  regionName: string;
  description: string;
  imageUrl: string;
  score: number;
  recommendedPlaces: RecommendedPlace[];
};

function RegionRecommendPage() {
  const navigate = useNavigate();

  /*
   * 현재 로그인 사용자와
   * 인증 상태 확인 여부
   */
  const { user, isLoading } = useAuth();

  const [step, setStep] = useState<Step>(0);

  const [place, setPlace] = useState('');
  const [moveType, setMoveType] = useState('');
  const [mood, setMood] = useState('');
  const [companion, setCompanion] = useState('');

  const [regionResult, setRegionResult] = useState<RegionResult | null>(null);

  const [loadingImageIndex, setLoadingImageIndex] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');

  /* =========================
     로그인 여부 확인
  ========================= */

  useEffect(() => {
    /*
     * 아직 로그인 상태 확인 중이면
     * 아무것도 하지 않음
     */
    if (isLoading) {
      return;
    }

    /*
     * 로그인하지 않은 경우
     * 로그인 페이지로 이동
     */
    if (!user) {
      navigate('/login', {
        replace: true,
      });
    }
  }, [isLoading, user, navigate]);

  /* =========================
     로딩 이미지
  ========================= */

  useEffect(() => {
    if (step !== 5) {
      return;
    }

    setLoadingImageIndex(0);

    const imageInterval = window.setInterval(() => {
      setLoadingImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(imageInterval);
    };
  }, [step]);

  /* =========================
     결과 화면 이동
  ========================= */

  useEffect(() => {
    if (step !== 5 || !regionResult) {
      return;
    }

    const resultTimer = window.setTimeout(() => {
      setStep(6);
    }, 1000);

    return () => {
      window.clearTimeout(resultTimer);
    };
  }, [step, regionResult]);

  /* =========================
     초기화
  ========================= */

  const resetForm = () => {
    setPlace('');
    setMoveType('');
    setMood('');
    setCompanion('');

    setRegionResult(null);
    setErrorMessage('');
  };

  /* =========================
     다음
  ========================= */

  const handleNext = () => {
    setStep((prev) => {
      if (prev >= 6) {
        return prev;
      }

      return (prev + 1) as Step;
    });
  };

  /* =========================
     이전
  ========================= */

  const handleBack = () => {
    if (step === 0) {
      window.history.back();
      return;
    }

    if (step === 1) {
      resetForm();
      setStep(0);
      return;
    }

    setStep((prev) => (prev - 1) as Step);
  };

  /* =========================
     장소 랜덤 3개
  ========================= */

  const getRandomThreePlaces = (places: PlaceSummaryResponse[]): RecommendedPlace[] => {
    const shuffled = [...places].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 3).map((item) => ({
      id: item.placeId,
      name: item.title,
      imageUrl: item.imageUrl,
    }));
  };

  /* =========================
     지역 추천
  ========================= */

  const handleResult = async () => {
    /*
     * 로그인 정보가 없는 경우
     */
    if (!user) {
      navigate('/login', {
        replace: true,
      });

      return;
    }

    setErrorMessage('');
    setRegionResult(null);

    /*
     * 결과를 계산하는 동안
     * 로딩 화면 표시
     */
    setStep(5);

    try {
      /* =========================
         1. 지역 추천 API

         POST /api/region/recommend
      ========================= */

      const recommendResponse = await apiFetch('/api/region/recommend', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          placeType: place,
          transport: moveType,
          mood,
          companion,
        }),
      });

      /*
       * JWT 인증 실패
       */
      if (recommendResponse.status === 401) {
        navigate('/login', {
          replace: true,
        });

        return;
      }

      if (!recommendResponse.ok) {
        throw new Error(`지역 추천 실패 (${recommendResponse.status})`);
      }

      const recommendData = (await recommendResponse.json()) as RegionRecommendResponse;

      /* =========================
         2. 추천 지역 → District 변환
      ========================= */

      const district = REGION_TO_DISTRICT[recommendData.regionName];

      if (!district) {
        throw new Error(`지역 코드를 찾을 수 없습니다: ${recommendData.regionName}`);
      }

      /* =========================
         3. 추천 지역의 관광지 조회

         기존 장소 API 사용

         GET /api/placeguide
         ?districts=YEONSU
         &categories=ATTRACTION
      ========================= */

      const placeResponse = await apiFetch(
        `/api/placeguide?districts=${encodeURIComponent(district)}&categories=ATTRACTION`,
        {
          method: 'GET',
        },
      );

      if (placeResponse.status === 401) {
        navigate('/login', {
          replace: true,
        });

        return;
      }

      if (!placeResponse.ok) {
        throw new Error(`추천 장소 조회 실패 (${placeResponse.status})`);
      }

      const places = (await placeResponse.json()) as PlaceSummaryResponse[];

      /* =========================
         4. 관광지 중 랜덤 3개
      ========================= */

      const recommendedPlaces = getRandomThreePlaces(places);

      /* =========================
         5. 최종 결과 저장
      ========================= */

      setRegionResult({
        regionName: recommendData.regionName,

        /*
         * description은 데이터에는 보관하지만
         * 결과 화면에서는 표시하지 않음
         */
        description: recommendData.description,

        /*
         * 백엔드 imageUrl 대신
         * 프론트 assets의 구/군 이미지를 사용
         */
        imageUrl: REGION_IMAGE_MAP[recommendData.regionName] ?? '',

        score: recommendData.score,

        recommendedPlaces,
      });
    } catch (error) {
      console.error('지역 추천 결과 조회 실패:', error);

      setErrorMessage(error instanceof Error ? error.message : '지역 추천에 실패했습니다.');
    }
  };

  /* =========================
     홈
  ========================= */

  const handleHome = () => {
    navigate('/');
  };

  /* =========================
     다시 테스트
  ========================= */

  const handleRetry = () => {
    resetForm();
    setStep(0);
  };

  /* =========================
     인증 확인 중
  ========================= */

  if (isLoading) {
    return null;
  }

  /* =========================
     비로그인
  ========================= */

  if (!user) {
    return null;
  }

  /* =========================
     진행도
  ========================= */

  const progress = step >= 1 && step <= 4 ? (step / 4) * 100 : 0;

  /*
   * 로그인한 사용자의 닉네임
   */
  const nickname = user.nickname;

  return (
    <div className="region-recommend-page">
      <Header />

      <main className="region-recommend-content">
        {/* =========================
            시작 화면
        ========================= */}

        {step === 0 && (
          <>
            <BackHeader title="GUMBTI" onBack={handleBack} />

            <section className="region-intro-section">
              <div className="region-intro-title">
                <Typography variant="subtitle1">
                  {nickname} 님의 취향을 담아
                  <br />
                  인천광역시의 지역을
                  <br />
                  추천드릴게요!
                </Typography>
              </div>

              <div className="region-intro-image">
                <img
                  src={RegionRecommendIntro}
                  alt="맞춤 지역 추천 안내"
                  className="region-intro-image__img"
                />
              </div>

              <Button
                size="main"
                variant="primary"
                className="region-intro-button"
                onClick={handleNext}
              >
                맞춤 지역 찾기 시작!
              </Button>
            </section>
          </>
        )}

        {/* =========================
            질문 헤더
        ========================= */}

        {step >= 1 && step <= 4 && (
          <>
            <BackHeader title="이전으로" onBack={handleBack} />

            <div className="region-progress">
              <div
                className="region-progress__active"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </>
        )}

        {/* =========================
            질문 1
        ========================= */}

        {step === 1 && (
          <section className="region-question-section">
            <div className="region-question-title">
              <Typography variant="subtitle1">가장 가고 싶은 장소는?</Typography>
            </div>

            <div className="region-option-grid">
              {PLACE_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="small"
                  active={place === option}
                  onClick={() => setPlace(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="region-bottom-button"
              disabled={!place}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            질문 2
        ========================= */}

        {step === 2 && (
          <section className="region-question-section">
            <div className="region-question-title">
              <Typography variant="subtitle1">이동은 어떤 편이 좋은가요?</Typography>
            </div>

            <div className="region-option-list">
              {MOVE_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="large"
                  active={moveType === option}
                  onClick={() => setMoveType(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="region-bottom-button"
              disabled={!moveType}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            질문 3
        ========================= */}

        {step === 3 && (
          <section className="region-question-section">
            <div className="region-question-title">
              <Typography variant="subtitle1">가장 끌리는 여행 분위기는?</Typography>
            </div>

            <div className="region-option-grid">
              {MOOD_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="small"
                  active={mood === option}
                  onClick={() => setMood(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="region-bottom-button"
              disabled={!mood}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            질문 4
        ========================= */}

        {step === 4 && (
          <section className="region-question-section">
            <div className="region-question-title">
              <Typography variant="subtitle1">여행을 주로 누구와 함께 하시나요?</Typography>
            </div>

            <div className="region-option-grid">
              {COMPANION_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="small"
                  active={companion === option}
                  onClick={() => setCompanion(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="region-bottom-button"
              disabled={!companion}
              onClick={handleResult}
            >
              결과 보기
            </Button>
          </section>
        )}

        {/* =========================
            로딩
        ========================= */}

        {step === 5 && (
          <section className="region-loading-section">
            <Typography variant="subtitle1">
              추천할 지역을
              <br />
              생각하고 있어요
            </Typography>

            <img
              src={loadingImageIndex === 0 ? RegionRecommendLoading1 : RegionRecommendLoading2}
              alt="맞춤 지역 추천 생성 중"
              className="region-loading-image"
            />

            {errorMessage && <Typography variant="p2">{errorMessage}</Typography>}
          </section>
        )}

        {/* =========================
            결과
        ========================= */}

        {step === 6 && regionResult && (
          <section className="region-result-section">
            {/* =========================
                결과 제목
            ========================= */}

            <div className="region-result-heading">
              <div className="region-result-heading__first">
                <Typography variant="head2">{nickname} 님의 GUMBTI는,</Typography>
              </div>

              <div className="region-result-heading__second">
                <div className="region-result-name">
                  <Typography variant="head1">{regionResult.regionName}</Typography>
                </div>

                <Typography variant="head2">입니다.</Typography>
              </div>
            </div>

            {/* =========================
                지역 대표 이미지

                API imageUrl 사용 X
                → assets의 구/군 이미지 사용
            ========================= */}

            <div className="region-result-image">
              {regionResult.imageUrl ? (
                <img src={regionResult.imageUrl} alt={regionResult.regionName} />
              ) : (
                <Typography variant="p2">{regionResult.regionName}</Typography>
              )}
            </div>

            {/* =========================
                추천 장소

                제목 제거
                지역 설명 제거
            ========================= */}

            <section className="region-recommended-section">
              {regionResult.recommendedPlaces.length > 0 ? (
                <div className="region-recommended-list">
                  {regionResult.recommendedPlaces.map((place) => (
                    <div key={place.id} className="region-recommended-item">
                      <div className="region-recommended-image">
                        {place.imageUrl ? (
                          <img src={place.imageUrl} alt={place.name} />
                        ) : (
                          <span
                            className="region-recommended-image-placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <Typography variant="p3">{place.name}</Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="p2">추천할 관광지가 없습니다.</Typography>
              )}
            </section>

            {/* =========================
                결과 버튼
            ========================= */}

            <div className="region-result-buttons">
              <Button size="middle" variant="primary" onClick={handleHome}>
                홈으로
              </Button>

              <Button size="middle" variant="primary" onClick={handleRetry}>
                다시 테스트하기
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default RegionRecommendPage;
