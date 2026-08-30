import { useEffect, useState } from 'react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Button from '@/components/Button/Button';

import OptionTab from '@/components/Tab/OptionTab';
import LineTab from '@/components/Tab/LineTab';
import RoundTab from '@/components/Tab/RoundTab';

import SingleCard from '@/components/Card/SingleCard';
import CostCard from '@/components/Card/CostCard';

import Typography from '@/components/Typography/Typography';

import CourseRecommendIntro from '@/assets/CourseRecommendIntro.png';
import CourseRecommendLoading1 from '@/assets/CourseRecommendLoading1.png';
import CourseRecommendLoading2 from '@/assets/CourseRecommendLoading2.png';

import { getMockCourseResult } from './mockData';
import type { CourseRecommendAnswers, CourseRecommendResult } from './types';

import './CourseRecommendPage.css';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/*
 * RoundTab activeIndex 타입과 맞춤
 *
 * 0 = 여행 계획
 * 1 = 예상 비용
 */
type ResultTabIndex = 0 | 1;

const TRANSPORT_OPTIONS = ['자차', '대중교통', '도보', '택시', '자전거', '공유차 / 렌터카'];

const SCHEDULE_OPTIONS = ['빡빡하고 바쁜, 많은 일정', '여유롭고 널널한, 적은 일정'];

const STYLE_OPTIONS = [
  '힐링',
  '맛집 탐방',
  '쇼핑',
  '관광',
  'SNS 핫플레이스',
  '체험 / 액티비티',
  '문화 / 예술 / 역사',
  '자연',
];

const COMPANION_OPTIONS = ['혼자', '가족', '친구', '연인', '아이', '부모님', '반려동물', '기타'];

function CourseRecommendPage() {
  const [step, setStep] = useState<Step>(0);

  /* =========================
     설문 값
  ========================= */

  const [transport, setTransport] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scheduleType, setScheduleType] = useState('');
  const [travelStyles, setTravelStyles] = useState<string[]>([]);
  const [companion, setCompanion] = useState('');

  /* =========================
     추천 결과
  ========================= */

  const [courseResult, setCourseResult] = useState<CourseRecommendResult | null>(null);

  /* 현재 선택된 DAY */
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  /*
   * 0 = 여행 계획
   * 1 = 예상 비용
   */
  const [resultTab, setResultTab] = useState<ResultTabIndex>(0);

  /* 로딩 이미지 */
  const [loadingImageIndex, setLoadingImageIndex] = useState(0);

  /* =========================
     오늘 날짜
  ========================= */

  const today = new Date();

  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(today.getDate()).padStart(2, '0')}`;

  /* =========================
     로딩 → 결과 화면
  ========================= */

  useEffect(() => {
    if (step !== 6) return;

    /* 로딩 화면 첫 번째 이미지 */
    setLoadingImageIndex(0);

    /* 1초마다 이미지 전환 */
    const imageInterval = window.setInterval(() => {
      setLoadingImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1000);

    /* 테스트용으로 3초 후 결과 화면 */
    const resultTimer = window.setTimeout(() => {
      setStep(7);
    }, 3000);

    return () => {
      window.clearInterval(imageInterval);
      window.clearTimeout(resultTimer);
    };
  }, [step]);

  /* =========================
     설문 전체 초기화
  ========================= */

  const resetForm = () => {
    setTransport('');
    setStartDate('');
    setEndDate('');
    setScheduleType('');
    setTravelStyles([]);
    setCompanion('');

    setCourseResult(null);

    setActiveDayIndex(0);
    setResultTab(0);
  };

  /* =========================
     다음
  ========================= */

  const handleNext = () => {
    setStep((prev) => {
      if (prev >= 7) return prev;

      return (prev + 1) as Step;
    });
  };

  /* =========================
     이전
  ========================= */

  const handleBack = () => {
    /*
     * 처음 설명 화면에서 뒤로가기
     */
    if (step === 0) {
      window.history.back();
      return;
    }

    /*
     * 첫 번째 질문 → 처음 설명 화면
     *
     * 이때 설문 전체 초기화
     */
    if (step === 1) {
      resetForm();
      setStep(0);
      return;
    }

    /*
     * 나머지는 선택값 유지
     */
    setStep((prev) => (prev - 1) as Step);
  };

  /* =========================
     여행 스타일 복수 선택
  ========================= */

  const handleStyleClick = (style: string) => {
    setTravelStyles((prev) => {
      if (prev.includes(style)) {
        return prev.filter((item) => item !== style);
      }

      return [...prev, style];
    });
  };

  /* =========================
     결과 생성
  ========================= */

  const handleResult = () => {
    const answers: CourseRecommendAnswers = {
      transport,
      startDate,
      endDate,
      scheduleType,
      travelStyles,
      companion,
    };

    /*
     * 현재는 Mock 추천 알고리즘
     *
     * 나중에는:
     *
     * const result =
     *   await recommendCourse(answers);
     *
     * 형태로 API 호출로 변경
     */
    const result = getMockCourseResult(answers);

    setCourseResult(result);

    /* 결과 화면 초기 상태 */
    setActiveDayIndex(0);
    setResultTab(0);

    /* 로딩 화면으로 이동 */
    setStep(6);
  };

  /* =========================
     홈으로
  ========================= */

  const handleHome = () => {
    window.location.href = '/';
  };

  /* =========================
     진행도
  ========================= */

  const progress = step >= 1 && step <= 5 ? (step / 5) * 100 : 0;

  /* =========================
     현재 DAY
  ========================= */

  const activeDay = courseResult?.days[activeDayIndex];

  /*
   * CostCard는 한 줄의 subLabel / subValue를
   * 받기 때문에 현재 DAY 비용을 문자열로 묶음
   *
   * 예:
   * 교통비 10,000원 · 식비 30,000원
   */

  return (
    <div className="course-recommend-page">
      <Header />

      <main className="course-recommend-content">
        {/* =========================
            0. 시작 화면
        ========================= */}

        {step === 0 && (
          <>
            <BackHeader title="맞춤 코스 추천" onBack={handleBack} />

            <section className="course-intro-section">
              <div className="course-intro-title">
                <Typography variant="subtitle1">
                  OOO 님의 취향을 담아
                  <br />
                  여행 코스를 추천드릴게요!
                </Typography>
              </div>

              <div className="course-intro-image">
                <img
                  src={CourseRecommendIntro}
                  alt="맞춤 코스 추천 안내"
                  className="course-intro-image__img"
                />
              </div>

              <Button
                size="main"
                variant="primary"
                className="course-intro-button"
                onClick={handleNext}
              >
                코스 추천 받기 시작!
              </Button>
            </section>
          </>
        )}

        {/* =========================
            질문 공통 상단
        ========================= */}

        {step >= 1 && step <= 5 && (
          <>
            <BackHeader title="이전으로" onBack={handleBack} />

            <div className="course-progress">
              <div
                className="course-progress__active"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </>
        )}

        {/* =========================
            1. 이동 수단
        ========================= */}

        {step === 1 && (
          <section className="course-question-section">
            <div className="course-question-title">
              <Typography variant="subtitle1">
                여행할 때 이용하실
                <br />
                이동 수단을 알려주세요.
              </Typography>
            </div>

            <div className="course-option-grid">
              {TRANSPORT_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="small"
                  active={transport === option}
                  onClick={() => setTransport(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="course-bottom-button"
              disabled={!transport}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            2. 여행 기간
        ========================= */}

        {step === 2 && (
          <section className="course-question-section">
            <div className="course-question-title">
              <Typography variant="subtitle1">여행 기간을 알려주세요.</Typography>
            </div>

            <div className="course-date-area">
              <div className="course-date-input">
                <label htmlFor="course-start-date">출발일</label>

                <input
                  id="course-start-date"
                  type="date"
                  value={startDate}
                  min={todayString}
                  onChange={(event) => {
                    const selectedStartDate = event.target.value;

                    setStartDate(selectedStartDate);

                    /*
                     * 기존 도착일이 새 출발일보다
                     * 빠르면 도착일 초기화
                     */
                    if (endDate && endDate < selectedStartDate) {
                      setEndDate('');
                    }
                  }}
                />
              </div>

              <div className="course-date-input">
                <label htmlFor="course-end-date">도착일</label>

                <input
                  id="course-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || todayString}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>

            <Button
              size="main"
              variant="primary"
              className="course-bottom-button"
              disabled={!startDate || !endDate}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            3. 여행 일정
        ========================= */}

        {step === 3 && (
          <section className="course-question-section">
            <div className="course-question-title">
              <Typography variant="subtitle1">선호하는 여행 일정은 무엇인가요?</Typography>
            </div>

            <div className="course-option-list">
              {SCHEDULE_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="large"
                  active={scheduleType === option}
                  onClick={() => setScheduleType(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="course-bottom-button"
              disabled={!scheduleType}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            4. 여행 스타일
        ========================= */}

        {step === 4 && (
          <section className="course-question-section">
            <div className="course-question-title">
              <Typography variant="subtitle1">
                선호하는 여행 스타일은
                <br />
                무엇인가요?
              </Typography>
            </div>

            <div className="course-option-grid">
              {STYLE_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="small"
                  active={travelStyles.includes(option)}
                  onClick={() => handleStyleClick(option)}
                />
              ))}
            </div>

            <Button
              size="main"
              variant="primary"
              className="course-bottom-button"
              disabled={travelStyles.length === 0}
              onClick={handleNext}
            >
              다음
            </Button>
          </section>
        )}

        {/* =========================
            5. 동행인
        ========================= */}

        {step === 5 && (
          <section className="course-question-section">
            <div className="course-question-title">
              <Typography variant="subtitle1">누구와 떠나시나요?</Typography>
            </div>

            <div className="course-option-grid">
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
              className="course-bottom-button"
              disabled={!companion}
              onClick={handleResult}
            >
              결과 보기
            </Button>
          </section>
        )}

        {/* =========================
            6. 로딩
        ========================= */}

        {step === 6 && (
          <section className="course-loading-section">
            <Typography variant="subtitle1">맞춤 코스를 짜고 있어요</Typography>

            <img
              src={loadingImageIndex === 0 ? CourseRecommendLoading1 : CourseRecommendLoading2}
              alt="맞춤 코스 생성 중"
              className="course-loading-image"
            />
          </section>
        )}

        {/* =========================
            7. 결과
        ========================= */}

        {step === 7 && courseResult && (
          <section className="course-result-section">
            {/* 결과 안내 */}
            <div className="course-result-title">
              <Typography variant="subtitle1">OOO 님을 위한 추천 코스입니다.</Typography>

              <Typography variant="p2">
                추천 코스를 저장하시고,
                <br />
                인천의 여러 지역을 경험해보세요!
              </Typography>
            </div>

            {/* 지도 */}
            <div className="course-map">
              <Typography variant="p2">코스 지도</Typography>
            </div>

            {/* =========================
                DAY 탭
                공용 LineTab
            ========================= */}

            <div className="course-result-line-tab">
              <LineTab
                items={courseResult.days.map((day) => `DAY ${day.day}`)}
                activeIndex={activeDayIndex}
                onChange={(index) => {
                  setActiveDayIndex(index);

                  /*
                   * 날짜를 바꾸면
                   * 여행 계획 탭부터 보여줌
                   */
                  setResultTab(0);
                }}
              />
            </div>

            {/* =========================
                여행 계획 / 예상 비용
                공용 RoundTab
            ========================= */}

            <div className="course-result-round-tab">
              <RoundTab
                options={['여행 계획', '예상 비용']}
                activeIndex={resultTab}
                onChange={setResultTab}
              />
            </div>

            {/* =========================
                여행 계획
                공용 SingleCard
            ========================= */}

            {resultTab === 0 && activeDay && (
              <div className="course-plan-list">
                {activeDay.places.map((place) => (
                  <SingleCard
                    key={place.id}
                    title={place.name}
                    subtitle={place.category}
                    imageUrl={place.imageUrl}
                  />
                ))}
              </div>
            )}

            {/* =========================
                예상 비용
                공용 CostCard
            ========================= */}

            {resultTab === 1 && activeDay && (
              <div className="course-cost-wrapper">
                <CostCard
                  title="요금 정보"
                  items={activeDay.costs.map((cost) => ({
                    label: cost.label,
                    value: `${cost.amount.toLocaleString()}원`,
                  }))}
                  totalLabel="총 예상 비용"
                  totalValue={`${activeDay.totalCost.toLocaleString()}원`}
                />
              </div>
            )}

            {/* =========================
                하단 버튼
            ========================= */}

            <div className="course-result-buttons">
              <Button size="main" variant="primary" onClick={handleHome}>
                홈으로
              </Button>

              <Button size="main" variant="primary">
                코스 저장하기
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CourseRecommendPage;
