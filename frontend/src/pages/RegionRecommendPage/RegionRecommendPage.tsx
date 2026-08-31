import { useEffect, useState } from 'react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Button from '@/components/Button/Button';
import OptionTab from '@/components/Tab/OptionTab';
import Typography from '@/components/Typography/Typography';

import RegionRecommendIntro from '@/assets/RegionRecommendIntro.png';
import RegionRecommendLoading1 from '@/assets/RegionRecommendLoading1.png';
import RegionRecommendLoading2 from '@/assets/RegionRecommendLoading2.png';

import { getMockRegionResult } from '@/pages/RegionRecommendPage/mockDate';
import type { RegionRecommendAnswers, RegionRecommendResult } from './types';

import './RegionRecommendPage.css';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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

function RegionRecommendPage() {
  const [step, setStep] = useState<Step>(0);

  /* =========================
     설문 답변
  ========================= */

  const [place, setPlace] = useState('');
  const [moveType, setMoveType] = useState('');
  const [mood, setMood] = useState('');
  const [companion, setCompanion] = useState('');

  /* =========================
     추천 결과
  ========================= */

  const [regionResult, setRegionResult] = useState<RegionRecommendResult | null>(null);

  const [loadingImageIndex, setLoadingImageIndex] = useState(0);

  /* =========================
     로딩 → 결과
  ========================= */

  useEffect(() => {
    if (step !== 5) return;

    // 로딩 화면에 들어오면 첫 번째 이미지부터 시작
    setLoadingImageIndex(0);

    // 1초마다 이미지 변경
    const imageInterval = window.setInterval(() => {
      setLoadingImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1000);

    // 테스트용: 3초 뒤 결과 화면으로 이동
    const resultTimer = window.setTimeout(() => {
      setStep(6);
    }, 3000);

    return () => {
      window.clearInterval(imageInterval);
      window.clearTimeout(resultTimer);
    };
  }, [step]);

  /* =========================
     전체 초기화
  ========================= */

  const resetForm = () => {
    setPlace('');
    setMoveType('');
    setMood('');
    setCompanion('');

    setRegionResult(null);
  };

  /* =========================
     다음
  ========================= */

  const handleNext = () => {
    setStep((prev) => {
      if (prev >= 6) return prev;

      return (prev + 1) as Step;
    });
  };

  /* =========================
     이전

     step 4 → 3 : 선택 유지
     step 3 → 2 : 선택 유지
     step 2 → 1 : 선택 유지

     step 1 → 0 :
     시작 화면으로 돌아가면서 전체 초기화
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
     결과 생성
  ========================= */

  const handleResult = () => {
    const answers: RegionRecommendAnswers = {
      place,
      moveType,
      mood,
      companion,
    };

    /*
     * 현재는 목 추천 알고리즘
     *
     * 추후 API가 생기면
     *
     * const result = await recommendRegion(answers);
     *
     * 로 변경
     */
    const result = getMockRegionResult(answers);

    setRegionResult(result);

    /* 로딩 화면 */
    setStep(5);
  };

  /* =========================
     홈으로
  ========================= */

  const handleHome = () => {
    window.location.href = '/';
  };

  /* =========================
     다시 테스트
  ========================= */

  const handleRetry = () => {
    resetForm();
    setStep(0);
  };

  /* =========================
     진행도
  ========================= */

  const progress = step >= 1 && step <= 4 ? (step / 4) * 100 : 0;

  return (
    <div className="region-recommend-page">
      {/* 공용 Header */}
      <Header />

      <main className="region-recommend-content">
        {/* =========================
            0. GUMBTI 시작 화면
        ========================= */}

        {step === 0 && (
          <>
            <BackHeader title="GUMBTI" onBack={handleBack} />

            <section className="region-intro-section">
              <div className="region-intro-title">
                <Typography variant="subtitle1">
                  OOO 님의 취향을 담아
                  <br />
                  인천광역시의 지역을 추천드릴게요!
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
            질문 공통 헤더
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
            1. 장소
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
            2. 이동 방식
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
            3. 여행 분위기
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
            4. 동행인
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
            5. 로딩
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
          </section>
        )}

        {/* =========================
            6. 결과
        ========================= */}

        {step === 6 && regionResult && (
          <section className="region-result-section">
            {/* 결과 제목 */}
            <div className="region-result-heading">
              <Typography variant="subtitle1">OOO 님의 GUMBTI는,</Typography>

              <div className="region-result-name">
                <Typography variant="head2">{regionResult.regionName}</Typography>
              </div>

              <Typography variant="subtitle1">입니다.</Typography>
            </div>

            {/* 지역 대표 이미지
                실제 이미지가 들어오면 img로 변경 */}
            <div className="region-result-image">
              {regionResult.imageUrl ? (
                <img src={regionResult.imageUrl} alt={regionResult.regionName} />
              ) : (
                <Typography variant="p2">{regionResult.regionName} 지역 이미지</Typography>
              )}
            </div>

            {/* 결과 설명 */}
            <div className="region-result-description">
              <Typography variant="subtitle2">{regionResult.title}</Typography>

              <Typography variant="p2">{regionResult.description}</Typography>
            </div>

            {/* =========================
                추천 장소
            ========================= */}

            <section className="region-recommended-section">
              <div className="region-recommended-title">
                <Typography variant="subtitle2">추천 장소</Typography>
              </div>

              <div className="region-recommended-list">
                {regionResult.recommendedPlaces.map((place) => (
                  <div key={place.id} className="region-recommended-item">
                    <div className="region-recommended-image">
                      {place.imageUrl ? (
                        <img src={place.imageUrl} alt={place.name} />
                      ) : (
                        <span className="region-recommended-image-placeholder" aria-hidden="true" />
                      )}
                    </div>

                    <Typography variant="p3">{place.name}</Typography>
                  </div>
                ))}
              </div>
            </section>

            {/* 하단 버튼 */}
            <div className="region-result-buttons">
              <Button size="main" variant="primary" onClick={handleHome}>
                홈으로
              </Button>

              <Button size="main" variant="primary" onClick={handleRetry}>
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
