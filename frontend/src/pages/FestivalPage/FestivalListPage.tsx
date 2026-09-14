import { useEffect, useRef, useState } from 'react';

import type { PointerEvent as ReactPointerEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import LineTab from '@/components/Tab/LineTab';
import Typography from '@/components/Typography/Typography';

import './FestivalListPage.css';

/* =========================
   API 설정
========================= */

const API_BASE_URL = 'http://localhost:8080';

/* =========================
   축제 타입
========================= */

interface FestivalItem {
  id: string;
  name: string;
  posterUrl: string;
  address: string;
  startDate: string;
  endDate: string;
}

/* =========================
   구 / 군
========================= */

const FESTIVAL_DISTRICTS = [
  '전체',
  '제물포구',
  '영종구',
  '미추홀구',
  '연수구',
  '남동구',
  '부평구',
  '계양구',
  '서해구',
  '검단구',
  '강화군',
  '옹진군',
];

/*
 * 실제 축제 API 조회용 지역
 *
 * 현재 FestivalService에서
 * 새 행정구역명을 받아 실제 지역으로 변환하므로
 * 프론트에서는 우선 동일한 이름을 전달
 */
const FESTIVAL_API_REGIONS: Record<string, string> = {
  전체: '전체',

  제물포구: '제물포구',
  영종구: '영종구',

  미추홀구: '미추홀구',
  연수구: '연수구',
  남동구: '남동구',
  부평구: '부평구',
  계양구: '계양구',

  서해구: '서해구',
  검단구: '검단구',

  강화군: '강화군',
  옹진군: '옹진군',
};

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

function formatFestivalDate(date: string) {
  if (!date || date.length !== 8) {
    return date;
  }

  return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
}

/* =========================
   FestivalListPage
========================= */

function FestivalListPage() {
  const navigate = useNavigate();

  /* =========================
     상단 캐러셀
  ========================= */

  const [featuredFestivals, setFeaturedFestivals] = useState<FestivalItem[]>([]);

  const [activePosterIndex, setActivePosterIndex] = useState(0);

  const [dragOffset, setDragOffset] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const pointerStartX = useRef<number | null>(null);

  const hasDragged = useRef(false);

  const pendingDirection = useRef<MoveDirection>(0);

  /* =========================
     구 / 군
  ========================= */

  // 처음에는 "전체"가 선택됨
  const [activeDistrictIndex, setActiveDistrictIndex] = useState(0);

  const activeDistrict = FESTIVAL_DISTRICTS[activeDistrictIndex];

  /* =========================
     구/군별 축제
  ========================= */

  const [districtFestivals, setDistrictFestivals] = useState<FestivalItem[]>([]);

  const [isDistrictLoading, setIsDistrictLoading] = useState(true);

  const [districtError, setDistrictError] = useState<string | null>(null);

  /* =========================
     인기 축제 TOP5 조회
  ========================= */

  useEffect(() => {
    const fetchPopularFestivals = async () => {
      try {
        setIsFeaturedLoading(true);
        setFeaturedError(null);

        const response = await fetch(`${API_BASE_URL}/festivals/popular`);

        if (!response.ok) {
          throw new Error(`인기 축제 조회 실패 (${response.status})`);
        }

        const data = await response.json();

        const festivals: FestivalItem[] = data.map(
          (item: {
            contentId: string;
            title: string;
            imageUrl: string;
            startDate: string;
            endDate: string;
          }) => ({
            id: item.contentId,
            name: item.title,
            posterUrl: item.imageUrl,
            address: '',
            startDate: item.startDate,
            endDate: item.endDate,
          }),
        );

        setFeaturedFestivals(festivals);

        setActivePosterIndex(0);
      } catch (error) {
        console.error('인기 축제 조회 실패:', error);

        setFeaturedError('인기 축제 / 행사 정보를 불러오지 못했습니다.');

        setFeaturedFestivals([]);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    fetchPopularFestivals();
  }, []);

  /* =========================
     축제 조회
  ========================= */

  useEffect(() => {
    if (!activeDistrict) {
      return;
    }

    const fetchDistrictFestivals = async () => {
      try {
        setIsDistrictLoading(true);
        setDistrictError(null);

        /*
         * 전체를 선택한 경우
         *
         * GET /festivals?region=전체
         *
         * 백엔드에서 "전체"는 구/군 코드로 매칭되지 않으므로
         * lDongSignguCd 없이 인천 전체를 조회하게 됨.
         */

        const apiRegion = FESTIVAL_API_REGIONS[activeDistrict];

        const response = await fetch(
          `${API_BASE_URL}/festivals?region=${encodeURIComponent(apiRegion)}`,
        );
        if (!response.ok) {
          throw new Error(`축제 조회 실패 (${response.status})`);
        }

        const data = await response.json();

        const festivals: FestivalItem[] = data.map(
          (item: {
            contentId: string;
            title: string;
            imageUrl: string;
            location: string;
            startDate: string;
            endDate: string;
          }) => ({
            id: item.contentId,
            name: item.title,
            posterUrl: item.imageUrl,
            address: item.location,
            startDate: item.startDate,
            endDate: item.endDate,
          }),
        );

        setDistrictFestivals(festivals);
      } catch (error) {
        console.error('축제 조회 실패:', error);

        setDistrictError('축제 / 행사 정보를 불러오지 못했습니다.');

        setDistrictFestivals([]);
      } finally {
        setIsDistrictLoading(false);
      }
    };

    fetchDistrictFestivals();
  }, [activeDistrict]);

  /* =========================
     인기 축제 개수
  ========================= */

  const posterCount = featuredFestivals.length;

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

    return featuredFestivals[index];
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

    if (direction === 1) {
      setDragOffset(-SLIDE_DISTANCE);
    }

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

    if (direction !== 0) {
      setActivePosterIndex((current) => getWrappedIndex(current + direction));
    }

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

    if (dragOffset < -SWIPE_THRESHOLD) {
      startSlide(1);
      return;
    }

    if (dragOffset > SWIPE_THRESHOLD) {
      startSlide(-1);
      return;
    }

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
    const x = offset * SLIDE_DISTANCE + dragOffset;

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

  const handleFeaturedClick = (offset: number, festivalId: string) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }

    if (offset === 0) {
      navigate(`/festivals/${festivalId}`);

      return;
    }

    if (offset < 0) {
      startSlide(-1);

      return;
    }

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

    if (targetIndex === previousIndex) {
      startSlide(-1);

      return;
    }

    if (targetIndex === nextIndex) {
      startSlide(1);

      return;
    }

    setActivePosterIndex(targetIndex);
  };

  /* =========================
     구 / 군 변경
  ========================= */

  const handleDistrictChange = (index: number) => {
    setActiveDistrictIndex(index);
  };

  /* =========================
     렌더링
  ========================= */

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

        {isFeaturedLoading ? (
          <section className="festival-featured-section">
            <div className="festival-empty">
              <Typography variant="p2">인기 축제 / 행사 정보를 불러오는 중입니다.</Typography>
            </div>
          </section>
        ) : featuredError ? (
          <section className="festival-featured-section">
            <div className="festival-empty">
              <Typography variant="p2">{featuredError}</Typography>
            </div>
          </section>
        ) : posterCount > 0 ? (
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
    현재 축제 정보
========================= */}

            {getFestivalAtOffset(0) && (
              <div className="festival-featured-info">
                <Typography variant="head3" className="festival-featured-info__name">
                  {getFestivalAtOffset(0)?.name}
                </Typography>

                <Typography
                  variant="caption1"
                  color="#828585"
                  className="festival-featured-info__date"
                >
                  {formatFestivalDate(getFestivalAtOffset(0)?.startDate ?? '')}
                  {' ~ '}
                  {formatFestivalDate(getFestivalAtOffset(0)?.endDate ?? '')}
                </Typography>
              </div>
            )}

            {/* =========================
                위치 표시
            ========================= */}

            <div className="festival-carousel-dots">
              {featuredFestivals.map((festival, index) => (
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
        ) : (
          <section className="festival-featured-section">
            <div className="festival-empty">
              <Typography variant="p2">현재 인기 축제 / 행사가 없습니다.</Typography>
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
            onChange={handleDistrictChange}
          />
        </div>

        {/* =========================
            축제 목록
        ========================= */}

        <section className="festival-grid">
          {isDistrictLoading ? (
            <div className="festival-empty">
              <Typography variant="p2" color="#828585">
                {activeDistrict === '전체'
                  ? '전체 축제 / 행사 정보를 불러오는 중입니다.'
                  : `${activeDistrict}의 축제 / 행사 정보를 불러오는 중입니다.`}
              </Typography>
            </div>
          ) : districtError ? (
            <div className="festival-empty">
              <Typography variant="p2" color="#828585">
                {districtError}
              </Typography>
            </div>
          ) : districtFestivals.length > 0 ? (
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
