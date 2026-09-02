import { useMemo, useRef, useState } from 'react';

import type { PointerEvent as ReactPointerEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import LineTab from '@/components/Tab/LineTab';
import Typography from '@/components/Typography/Typography';

import { FESTIVAL_DISTRICTS, FESTIVAL_MOCK_DATA, FEATURED_FESTIVALS } from './mockData';

import type { FestivalItem } from './types';

import './FestivalListPage.css';

/* =========================
   캐러셀 설정
========================= */

const SLIDE_DISTANCE = 180;
const SWIPE_THRESHOLD = 45;
const SIDE_SCALE = 0.88;

const CAROUSEL_OFFSETS = [-2, -1, 0, 1, 2] as const;

type MoveDirection = -1 | 0 | 1;

/* =========================
   축제 포스터
========================= */

interface FestivalPosterProps {
  festival: FestivalItem;
  className?: string;
}

function FestivalPoster({ festival, className = '' }: FestivalPosterProps) {
  const classNames = ['festival-poster', className].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      {festival.posterUrl ? (
        <img src={festival.posterUrl} alt={`${festival.name} 포스터`} />
      ) : (
        <Typography variant="p0">축제 포스터</Typography>
      )}
    </div>
  );
}

/* =========================
   FestivalListPage
========================= */

function FestivalListPage() {
  const navigate = useNavigate();

  /* =========================
     상단 캐러셀
  ========================= */

  const [activePosterIndex, setActivePosterIndex] = useState(0);

  const [dragOffset, setDragOffset] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const pointerStartX = useRef<number | null>(null);

  const hasDragged = useRef(false);

  const pendingDirection = useRef<MoveDirection>(0);

  /* =========================
     구 / 군
  ========================= */

  const [activeDistrictIndex, setActiveDistrictIndex] = useState(0);

  const activeDistrict = FESTIVAL_DISTRICTS[activeDistrictIndex];

  /* =========================
     구/군별 축제
  ========================= */

  const districtFestivals = useMemo(() => {
    return FESTIVAL_MOCK_DATA.filter((festival) => festival.district === activeDistrict);
  }, [activeDistrict]);

  const posterCount = FEATURED_FESTIVALS.length;

  /* =========================
     순환 index
  ========================= */

  const getWrappedIndex = (index: number) => {
    if (posterCount === 0) {
      return 0;
    }

    return ((index % posterCount) + posterCount) % posterCount;
  };

  /* =========================
     offset 위치의 축제
  ========================= */

  const getFestivalAtOffset = (offset: number) => {
    if (posterCount === 0) {
      return undefined;
    }

    const index = getWrappedIndex(activePosterIndex + offset);

    return FEATURED_FESTIVALS[index];
  };

  /* =========================
     한 칸 이동 시작

     1  = 다음
     -1 = 이전
  ========================= */

  const startSlide = (direction: MoveDirection) => {
    if (direction === 0 || isAnimating || posterCount <= 1) {
      return;
    }

    pendingDirection.current = direction;

    setIsDragging(false);

    setIsAnimating(true);

    /*
     * 다음으로 이동
     * → 전체 포스터가 왼쪽으로
     */
    if (direction === 1) {
      setDragOffset(-SLIDE_DISTANCE);
    }

    /*
     * 이전으로 이동
     * → 전체 포스터가 오른쪽으로
     */
    if (direction === -1) {
      setDragOffset(SLIDE_DISTANCE);
    }
  };

  /* =========================
     이동 애니메이션 종료
  ========================= */

  const handleSlideTransitionEnd = () => {
    if (!isAnimating) {
      return;
    }

    const direction = pendingDirection.current;

    /*
     * 실제 index 변경
     *
     * 첫 번째 → 이전
     * = 마지막
     *
     * 마지막 → 다음
     * = 첫 번째
     *
     * 모듈러 연산으로 자연스럽게 처리
     */
    if (direction !== 0) {
      setActivePosterIndex((current) => getWrappedIndex(current + direction));
    }

    /*
     * 현재 화면 모습은 그대로인데
     * 내부 좌표만 중앙으로 초기화
     *
     * transition 클래스를 동시에 제거하므로
     * 순간이동이 눈에 보이지 않음
     */
    pendingDirection.current = 0;

    setIsAnimating(false);
    setDragOffset(0);
  };

  /* =========================
     드래그 시작
  ========================= */

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isAnimating || posterCount <= 1) {
      return;
    }

    pointerStartX.current = event.clientX;

    hasDragged.current = false;

    setIsDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /* =========================
     드래그 중
  ========================= */

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null || isAnimating) {
      return;
    }

    const difference = event.clientX - pointerStartX.current;

    /*
     * 너무 멀리 끌리는 것 방지
     */
    const maxOffset = SLIDE_DISTANCE * 1.15;

    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, difference));

    setDragOffset(limitedOffset);

    if (Math.abs(difference) > 5) {
      hasDragged.current = true;
    }
  };

  /* =========================
     드래그 종료
  ========================= */

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) {
      return;
    }

    pointerStartX.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    /*
     * 왼쪽으로 충분히 밀었음
     * → 다음 포스터
     */
    if (dragOffset < -SWIPE_THRESHOLD) {
      startSlide(1);
      return;
    }

    /*
     * 오른쪽으로 충분히 밀었음
     * → 이전 포스터
     */
    if (dragOffset > SWIPE_THRESHOLD) {
      startSlide(-1);
      return;
    }

    /*
     * 기준만큼 밀지 않았으면
     * 원래 위치로 복귀
     */
    setIsDragging(false);

    if (Math.abs(dragOffset) > 2) {
      pendingDirection.current = 0;

      setIsAnimating(true);
      setDragOffset(0);
    } else {
      setDragOffset(0);
    }
  };

  /* =========================
     드래그 취소
  ========================= */

  const handlePointerCancel = () => {
    pointerStartX.current = null;

    pendingDirection.current = 0;

    setIsDragging(false);
    setDragOffset(0);
  };

  /* =========================
     포스터 위치 계산
  ========================= */

  const getSlideStyle = (offset: number) => {
    /*
     * 각 포스터의 실제 화면 위치
     */
    const x = offset * SLIDE_DISTANCE + dragOffset;

    /*
     * 중앙에 가까울수록
     * scale = 1
     *
     * 옆으로 갈수록
     * scale = 0.88
     */
    const distanceFromCenter = Math.abs(x);

    const progress = Math.min(distanceFromCenter / SLIDE_DISTANCE, 1);

    const scale = 1 - progress * (1 - SIDE_SCALE);

    return {
      transform: `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${scale})`,
      zIndex: Math.round(scale * 10),
    };
  };

  /* =========================
     상단 포스터 클릭
  ========================= */

  const handleFeaturedClick = (offset: number, festivalId: number) => {
    /*
     * 드래그 직후 클릭 방지
     */
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }

    /*
     * 가운데 포스터
     * → 상세페이지
     */
    if (offset === 0) {
      navigate(`/festivals/${festivalId}`);

      return;
    }

    /*
     * 왼쪽 포스터
     */
    if (offset < 0) {
      startSlide(-1);
      return;
    }

    /*
     * 오른쪽 포스터
     */
    startSlide(1);
  };

  /* =========================
     점 클릭
  ========================= */

  const handleDotClick = (targetIndex: number) => {
    if (isAnimating || targetIndex === activePosterIndex) {
      return;
    }

    const previousIndex = getWrappedIndex(activePosterIndex - 1);

    const nextIndex = getWrappedIndex(activePosterIndex + 1);

    /*
     * 바로 이전
     */
    if (targetIndex === previousIndex) {
      startSlide(-1);
      return;
    }

    /*
     * 바로 다음
     */
    if (targetIndex === nextIndex) {
      startSlide(1);
      return;
    }

    /*
     * 멀리 있는 점 클릭은
     * 해당 위치로 바로 이동
     */
    setActivePosterIndex(targetIndex);
  };

  return (
    <div className="festival-list-page">
      <Header />

      <main className="festival-list-content">
        {/* =========================
            BackHeader
        ========================= */}

        <div className="festival-list-header">
          <BackHeader title="축제 / 행사 정보" onBack={() => navigate(-1)} />
        </div>

        {/* =========================
            추천 축제 캐러셀
        ========================= */}

        {posterCount > 0 && (
          <section className="festival-featured-section">
            <div
              className={[
                'festival-carousel',
                isDragging ? 'festival-carousel--dragging' : '',
                isAnimating ? 'festival-carousel--animating' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              {CAROUSEL_OFFSETS.map((offset) => {
                const festival = getFestivalAtOffset(offset);

                if (!festival) {
                  return null;
                }

                return (
                  <button
                    key={`${festival.id}-${offset}`}
                    type="button"
                    className="festival-carousel__slide"
                    style={getSlideStyle(offset)}
                    onClick={() => handleFeaturedClick(offset, festival.id)}
                    onTransitionEnd={offset === 0 ? handleSlideTransitionEnd : undefined}
                    aria-label={
                      offset === 0
                        ? `${festival.name} 상세 보기`
                        : offset < 0
                          ? '이전 축제 보기'
                          : '다음 축제 보기'
                    }
                  >
                    <FestivalPoster festival={festival} className="festival-poster--featured" />
                  </button>
                );
              })}
            </div>

            {/* =========================
                위치 표시
            ========================= */}

            <div className="festival-carousel-dots">
              {FEATURED_FESTIVALS.map((festival, index) => (
                <button
                  key={festival.id}
                  type="button"
                  aria-label={`${index + 1}번째 축제 보기`}
                  className={
                    index === activePosterIndex
                      ? 'festival-carousel-dot festival-carousel-dot--active'
                      : 'festival-carousel-dot'
                  }
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          </section>
        )}

        {/* =========================
            구 / 군
        ========================= */}

        <div className="festival-district-tabs">
          <LineTab
            items={FESTIVAL_DISTRICTS}
            activeIndex={activeDistrictIndex}
            onChange={setActiveDistrictIndex}
          />
        </div>

        {/* =========================
            축제 목록
        ========================= */}

        <section className="festival-grid">
          {districtFestivals.length > 0 ? (
            districtFestivals.map((festival) => (
              <button
                key={festival.id}
                type="button"
                className="festival-card"
                onClick={() => navigate(`/festivals/${festival.id}`)}
              >
                <FestivalPoster festival={festival} className="festival-poster--card" />

                <Typography variant="head3" className="festival-card__name">
                  {festival.name}
                </Typography>
              </button>
            ))
          ) : (
            <div className="festival-empty">
              <Typography variant="p2" color="#828585">
                현재 등록된 축제 / 행사가 없어요.
              </Typography>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FestivalListPage;
