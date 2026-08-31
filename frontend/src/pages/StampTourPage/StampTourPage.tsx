import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import RoundTab from '@/components/Tab/RoundTab';
import Typography from '@/components/Typography/Typography';

import stampTourImage from '@/assets/StampTour/StampTour.png';

import { BADGE_MOCK_DATA, STAMP_MOCK_DATA, STAMP_USER } from './mockData';

import './StampTourPage.css';

/* =========================
   경로 기본 설정
========================= */

const PATH_WIDTH = 360;

/*
 * 시작 원 중심
 */
const START_POINT = {
  x: 70,
  y: 60,
};

/*
 * 시작 원 → 첫 번째 스탬프 거리
 *
 * 너무 멀지 않도록 별도 설정
 */
const FIRST_STAMP_GAP = 160;

/*
 * 첫 번째 이후
 * 모든 스탬프 사이의 실제 거리
 */
const STAMP_GAP = 170;

/*
 * S 곡선 좌우 끝
 */
const LEFT_X = 60;
const CENTER_X = 160;
const RIGHT_X = 290;

/*
 * S가 얼마나 세로로 길게
 * 이어질지 결정
 *
 * 작을수록 더 자주 꾸불거림
 * 클수록 더 완만함
 */
const CURVE_STEP_Y = 170;

/*
 * 곡선을 얼마나 촘촘하게
 * 계산할지 결정
 */
const CURVE_RESOLUTION = 20;

/*
 * 곡선 부드러움
 *
 * 값이 너무 크면 휘어짐이 과해지고,
 * 너무 작으면 직선처럼 보임
 */
const CURVE_TENSION = 0.9;

/* =========================
   Point
========================= */

interface PathPoint {
  x: number;
  y: number;
}

/* =========================
   S 곡선 기준점 생성
========================= */

function createGuidePoints(stampCount: number): PathPoint[] {
  const points: PathPoint[] = [
    START_POINT,

    /*
     * 시작점에서 첫 번째 방향은
     * 거의 수평에 가깝게 오른쪽으로
     */
    {
      x: 180,
      y: 80,
    },
  ];

  /*
   * 첫 번째 굴곡 시작
   */
  let y = 190;

  /*
   * 실제 필요한 길보다
   * 조금 더 길게 생성
   */
  const guideCount = stampCount * 2 + 6;

  for (let index = 0; index < guideCount; index += 1) {
    const patternIndex = index % 4;

    let x = CENTER_X;

    /*
     * 오른쪽 → 중앙 → 왼쪽 → 중앙
     * 반복
     */
    if (patternIndex === 0) {
      x = RIGHT_X;
    }

    if (patternIndex === 1) {
      x = CENTER_X;
    }

    if (patternIndex === 2) {
      x = LEFT_X;
    }

    if (patternIndex === 3) {
      x = CENTER_X;
    }

    points.push({
      x,
      y,
    });

    y += CURVE_STEP_Y;
  }

  return points;
}

/* =========================
   Cardinal / Catmull 형태의
   부드러운 곡선 보간
========================= */

function interpolateCurve(
  p0: PathPoint,
  p1: PathPoint,
  p2: PathPoint,
  p3: PathPoint,
  t: number,
): PathPoint {
  const t2 = t * t;
  const t3 = t2 * t;

  /*
   * 시작점과 끝점의 tangent
   */
  const m1x = (p2.x - p0.x) * CURVE_TENSION;

  const m1y = (p2.y - p0.y) * CURVE_TENSION;

  const m2x = (p3.x - p1.x) * CURVE_TENSION;

  const m2y = (p3.y - p1.y) * CURVE_TENSION;

  const h00 = 2 * t3 - 3 * t2 + 1;

  const h10 = t3 - 2 * t2 + t;

  const h01 = -2 * t3 + 3 * t2;

  const h11 = t3 - t2;

  return {
    x: h00 * p1.x + h10 * m1x + h01 * p2.x + h11 * m2x,

    y: h00 * p1.y + h10 * m1y + h01 * p2.y + h11 * m2y,
  };
}

/* =========================
   기준점들을 실제로 촘촘한
   부드러운 곡선으로 변환
========================= */

function createDenseCurve(guidePoints: PathPoint[]): PathPoint[] {
  if (guidePoints.length < 2) {
    return guidePoints;
  }

  const curve: PathPoint[] = [];

  for (let index = 0; index < guidePoints.length - 1; index += 1) {
    const p0 = guidePoints[Math.max(0, index - 1)];

    const p1 = guidePoints[index];

    const p2 = guidePoints[index + 1];

    const p3 = guidePoints[Math.min(guidePoints.length - 1, index + 2)];

    for (let step = 0; step < CURVE_RESOLUTION; step += 1) {
      const t = step / CURVE_RESOLUTION;

      curve.push(interpolateCurve(p0, p1, p2, p3, t));
    }
  }

  curve.push(guidePoints[guidePoints.length - 1]);

  return curve;
}

/* =========================
   곡선을 따라 실제 거리가
   일정하도록 스탬프 위치 생성
========================= */

function createStampPoints(curve: PathPoint[], stampCount: number): PathPoint[] {
  if (curve.length < 2 || stampCount <= 0) {
    return [];
  }

  const stamps: PathPoint[] = [];

  let accumulatedDistance = 0;

  let targetDistance = FIRST_STAMP_GAP;

  for (let index = 1; index < curve.length && stamps.length < stampCount; index += 1) {
    let segmentStart = curve[index - 1];

    const segmentEnd = curve[index];

    let remainingSegment = Math.hypot(
      segmentEnd.x - segmentStart.x,

      segmentEnd.y - segmentStart.y,
    );

    /*
     * 한 segment 안에
     * 스탬프 위치가 존재하는 경우
     */
    while (stamps.length < stampCount && accumulatedDistance + remainingSegment >= targetDistance) {
      const neededDistance = targetDistance - accumulatedDistance;

      const ratio = remainingSegment === 0 ? 0 : neededDistance / remainingSegment;

      const stampPoint: PathPoint = {
        x: segmentStart.x + (segmentEnd.x - segmentStart.x) * ratio,

        y: segmentStart.y + (segmentEnd.y - segmentStart.y) * ratio,
      };

      stamps.push(stampPoint);

      /*
       * 이번 스탬프 이후부터는
       * 모든 간격 동일
       */
      targetDistance = STAMP_GAP;

      /*
       * 남아있는 segment 계산
       */
      remainingSegment -= neededDistance;

      segmentStart = stampPoint;

      accumulatedDistance = 0;
    }

    accumulatedDistance += remainingSegment;
  }

  return stamps;
}

/* =========================
   전체 곡선 생성
========================= */

const GUIDE_POINTS = createGuidePoints(STAMP_MOCK_DATA.length);

const DENSE_CURVE = createDenseCurve(GUIDE_POINTS);

const STAMP_POINTS = createStampPoints(DENSE_CURVE, STAMP_MOCK_DATA.length);

/* =========================
   마지막 스탬프
========================= */

const LAST_STAMP = STAMP_POINTS[STAMP_POINTS.length - 1];

/* =========================
   마지막 스탬프까지만
   연결선 표시
========================= */

const DISPLAY_CURVE = LAST_STAMP
  ? [...DENSE_CURVE.filter((point) => point.y < LAST_STAMP.y), LAST_STAMP]
  : DENSE_CURVE;

/* =========================
   경로 높이
========================= */

const PATH_HEIGHT = (LAST_STAMP?.y ?? START_POINT.y) + 100;

/* =========================
   SVG path 생성
========================= */

function createPath(points: PathPoint[]) {
  if (points.length === 0) {
    return '';
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    path += ` L ${points[index].x} ${points[index].y}`;
  }

  return path;
}

/* =========================
   Page
========================= */

function StampTourPage() {
  const navigate = useNavigate();

  /* =========================
     탭
  ========================= */

  const [activeTabIndex, setActiveTabIndex] = useState<0 | 1>(0);

  /* =========================
     획득한 스탬프 개수
  ========================= */

  const ownedStampCount = STAMP_MOCK_DATA.filter((stamp) => stamp.owned).length;

  const stampPath = createPath(DISPLAY_CURVE);

  return (
    <div className="stamp-tour-page">
      <Header />

      <main className="stamp-tour-content">
        {/* =========================
            BackHeader
        ========================= */}

        <div className="stamp-tour-header">
          <BackHeader title="스탬프 투어" onBack={() => navigate(-1)} />
        </div>

        {/* =========================
            상단
        ========================= */}

        <section className="stamp-tour-hero">
          <img src={stampTourImage} alt="" className="stamp-tour-hero__image" />

          <div className="stamp-tour-hero__info">
            <Typography variant="p1" className="stamp-tour-hero__description" color="#56504B">
              {STAMP_USER.nickname} 님의 이번 달 스탬프
            </Typography>

            <Typography variant="head2" className="stamp-tour-hero__count" color="#56504B">
              {ownedStampCount}개
            </Typography>
          </div>
        </section>

        {/* =========================
            RoundTab
        ========================= */}

        <div className="stamp-tour-tabs">
          <RoundTab
            options={['누적 스탬프', '내 배지']}
            activeIndex={activeTabIndex}
            onChange={setActiveTabIndex}
          />
        </div>

        {/* =========================
            누적 스탬프
        ========================= */}

        {activeTabIndex === 0 && (
          <section className="stamp-tour-stamps">
            <div
              className="stamp-tour-path"
              style={{
                height: `${PATH_HEIGHT}px`,
              }}
            >
              {/* 연결선 */}

              <svg
                className="stamp-tour-path__line"
                viewBox={`0 0 ${PATH_WIDTH} ${PATH_HEIGHT}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={stampPath} />
              </svg>

              {/* =========================
                  시작 원
              ========================= */}

              <div
                className="stamp-tour-start"
                style={{
                  left: `${(START_POINT.x / PATH_WIDTH) * 100}%`,

                  top: `${START_POINT.y}px`,
                }}
              >
                <span>
                  스탬프 투어
                  <br />
                  시작!
                </span>
              </div>

              {/* =========================
                  전체 스탬프
              ========================= */}

              {STAMP_MOCK_DATA.map((stamp, index) => {
                const point = STAMP_POINTS[index];

                if (!point) {
                  return null;
                }

                return (
                  <div
                    key={stamp.id}
                    className={[
                      'stamp-tour-stamp',

                      stamp.owned ? 'stamp-tour-stamp--owned' : 'stamp-tour-stamp--locked',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      left: `${(point.x / PATH_WIDTH) * 100}%`,

                      top: `${point.y}px`,
                    }}
                  >
                    <div className="stamp-tour-stamp__mark">
                      <div className="stamp-tour-stamp__inner">
                        <span className="stamp-tour-stamp__icon">STAMP</span>
                      </div>
                    </div>

                    <Typography variant="p3" className="stamp-tour-stamp__region">
                      {stamp.region}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =========================
            내 배지
        ========================= */}

        {activeTabIndex === 1 && (
          <section className="stamp-tour-badges">
            <div className="stamp-tour-badge-grid">
              {BADGE_MOCK_DATA.map((badge) => (
                <div
                  key={badge.id}
                  className={[
                    'stamp-tour-badge',

                    badge.owned ? 'stamp-tour-badge--owned' : 'stamp-tour-badge--locked',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="stamp-tour-badge__image">
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name} />
                    ) : (
                      <span className="stamp-tour-badge__placeholder">BADGE</span>
                    )}
                  </div>

                  <Typography variant="p3" className="stamp-tour-badge__name">
                    {badge.name}
                  </Typography>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default StampTourPage;
