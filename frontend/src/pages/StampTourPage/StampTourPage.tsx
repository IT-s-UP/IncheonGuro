import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Typography from '@/components/Typography/Typography';

import { apiFetch } from '@/auth/api';
import { useAuth } from '@/auth/AuthContext';

import stampTourImage from '@/assets/StampTour/StampTour.png';

import stampTourStartPoint from '@/assets/StampTour/StampTour StartPoint.png';
import jemulpoStamp from '@/assets/StampTour/제물포구 스탬프.png';
import yeongjongStamp from '@/assets/StampTour/영종구 스탬프.png';
import michuholStamp from '@/assets/StampTour/미추홀구 스탬프.png';
import yeonsuStamp from '@/assets/StampTour/연수구 스탬프.png';
import namdongStamp from '@/assets/StampTour/남동구 스탬프.png';
import bupyeongStamp from '@/assets/StampTour/부평구 스탬프.png';
import gyeyangStamp from '@/assets/StampTour/계양구 스탬프.png';
import seohaeStamp from '@/assets/StampTour/서해구 스탬프.png';
import geomdanStamp from '@/assets/StampTour/검단구 스탬프.png';
import ganghwaStamp from '@/assets/StampTour/강화군 스탬프.png';
import ongjinStamp from '@/assets/StampTour/옹진군 스탬프.png';

import './StampTourPage.css';

/* =========================
   경로 기본 설정
========================= */

const PATH_WIDTH = 360;

const START_POINT = {
  x: 70,
  y: 60,
};

const FIRST_STAMP_GAP = 160;
const STAMP_GAP = 170;

const LEFT_X = 60;
const CENTER_X = 160;
const RIGHT_X = 290;

const CURVE_STEP_Y = 170;
const CURVE_RESOLUTION = 20;
const CURVE_TENSION = 0.9;

/* =========================
   전체 스탬프 지역
========================= */

const STAMP_REGIONS = [
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

const STAMP_IMAGE_MAP: Record<string, string> = {
  제물포구: jemulpoStamp,
  영종구: yeongjongStamp,
  미추홀구: michuholStamp,
  연수구: yeonsuStamp,
  남동구: namdongStamp,
  부평구: bupyeongStamp,
  계양구: gyeyangStamp,
  서해구: seohaeStamp,
  검단구: geomdanStamp,
  강화군: ganghwaStamp,
  옹진군: ongjinStamp,
};

/* =========================
   API Response
========================= */

interface RegionResponse {
  id: number;
  regionName: string;
}

interface MyStampResponse {
  regionId: number;
  regionName: string;
  imageUrl: string;
  achievedAt: string;
}

/* =========================
   화면에서 사용할 Stamp
========================= */

interface Stamp {
  id: number;
  region: string;
  owned: boolean;
  imageSrc: string;
}

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
    {
      x: 180,
      y: 80,
    },
  ];

  let y = 190;

  const guideCount = stampCount * 2 + 6;

  for (let index = 0; index < guideCount; index += 1) {
    const patternIndex = index % 4;

    let x = CENTER_X;

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
   촘촘한 곡선 생성
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
   곡선을 따라 스탬프 위치 생성
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

    let remainingSegment = Math.hypot(segmentEnd.x - segmentStart.x, segmentEnd.y - segmentStart.y);

    while (stamps.length < stampCount && accumulatedDistance + remainingSegment >= targetDistance) {
      const neededDistance = targetDistance - accumulatedDistance;

      const ratio = remainingSegment === 0 ? 0 : neededDistance / remainingSegment;

      const stampPoint: PathPoint = {
        x: segmentStart.x + (segmentEnd.x - segmentStart.x) * ratio,

        y: segmentStart.y + (segmentEnd.y - segmentStart.y) * ratio,
      };

      stamps.push(stampPoint);

      targetDistance = STAMP_GAP;

      remainingSegment -= neededDistance;

      segmentStart = stampPoint;

      accumulatedDistance = 0;
    }

    accumulatedDistance += remainingSegment;
  }

  return stamps;
}

/* =========================
   SVG Path 생성
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
   GPS 위치 가져오기
========================= */

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저에서는 위치 정보를 사용할 수 없습니다.'));

      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

/* =========================
   서버 오류 메시지 추출
========================= */

async function getErrorMessage(response: Response, defaultMessage: string): Promise<string> {
  try {
    const responseText = await response.text();

    if (!responseText) {
      return defaultMessage;
    }

    /*
     * 서버가 JSON 형태로 내려주는 경우
     *
     * {
     *   "status": 400,
     *   "message": "현재 위치에서는 해당 스탬프를 획득할 수 없습니다."
     * }
     *
     * 여기서 message만 추출
     */
    try {
      const json = JSON.parse(responseText);

      if (json && typeof json === 'object' && typeof json.message === 'string') {
        return json.message;
      }
    } catch {
      /*
       * JSON이 아니면 응답 문자열 자체를 사용
       */
    }

    return responseText;
  } catch {
    return defaultMessage;
  }
}

/* =========================
   Page
========================= */

function StampTourPage() {
  const navigate = useNavigate();

  const { user, isLoading: authLoading } = useAuth();

  const [stamps, setStamps] = useState<Stamp[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [claimingRegionId, setClaimingRegionId] = useState<number | null>(null);

  /*
   * /api/region에서 실제 지역 ID를 가져옴
   */
  const [regions, setRegions] = useState<RegionResponse[]>([]);

  /* =========================
     지역 목록 조회
  ========================= */

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('/api/region');

        if (!response.ok) {
          throw new Error(`지역 목록 조회 실패 (${response.status})`);
        }

        const data = (await response.json()) as RegionResponse[];

        setRegions(data);
      } catch (error) {
        console.error('지역 목록 조회 실패:', error);

        setError('지역 정보를 불러오지 못했습니다.');
      }
    };

    void fetchRegions();
  }, []);

  /* =========================
     내 스탬프 조회
  ========================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      setStamps([]);
      return;
    }

    if (regions.length === 0) {
      return;
    }

    const fetchMyStamps = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiFetch('/stamp/my');

        if (!response.ok) {
          throw new Error(`스탬프 조회 실패 (${response.status})`);
        }

        const data = (await response.json()) as MyStampResponse[];

        /*
         * /api/region에서 받은 실제 DB ID 사용
         */
        const nextStamps: Stamp[] = STAMP_REGIONS.map((regionName) => {
          const region = regions.find((item) => item.regionName === regionName);

          const ownedStamp = data.find((stamp) => stamp.regionName === regionName);

          return {
            id: region?.id ?? ownedStamp?.regionId ?? -1,

            region: regionName,

            owned: ownedStamp !== undefined,

            imageSrc: STAMP_IMAGE_MAP[regionName],
          };
        });

        setStamps(nextStamps);
      } catch (error) {
        console.error('내 스탬프 조회 실패:', error);

        setError('스탬프 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    void fetchMyStamps();
  }, [authLoading, user, regions]);

  /* =========================
     스탬프 획득
  ========================= */

  const handleClaim = async (stamp: Stamp) => {
    if (!user) {
      alert('로그인 후 스탬프를 획득할 수 있습니다.');

      return;
    }

    if (stamp.owned) {
      return;
    }

    /*
     * /api/region에서 받은 실제 DB ID
     */
    const regionId = stamp.id;

    if (regionId <= 0) {
      alert('지역 정보를 불러오지 못했습니다. 다시 시도해주세요.');

      return;
    }

    try {
      setClaimingRegionId(regionId);

      /*
       * 스탬프 클릭 순간 현재 GPS 조회
       */
      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      /*
       * 스탬프 획득 API
       */
      const response = await apiFetch(`/stamp/${regionId}/claim`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });

      /* =========================
         409
         이미 획득
      ========================= */

      if (response.status === 409) {
        alert('이미 획득한 스탬프예요!');

        return;
      }

      /* =========================
         401
         인증 실패
      ========================= */

      if (response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');

        return;
      }

      /* =========================
         400
         위치 불일치
      ========================= */

      if (response.status === 400) {
        const message = await getErrorMessage(
          response,
          '현재 위치에서는 해당 스탬프를 획득할 수 없습니다.',
        );

        alert(message);

        return;
      }

      /* =========================
         그 외 오류
      ========================= */

      if (!response.ok) {
        const message = await getErrorMessage(response, '스탬프 획득에 실패했습니다.');

        throw new Error(message);
      }

      /* =========================
         획득 성공
      ========================= */

      alert(`${stamp.region} 스탬프를 획득했습니다!`);

      /*
       * 획득 후 서버에서 최신 목록 재조회
       */
      const stampResponse = await apiFetch('/stamp/my');

      if (!stampResponse.ok) {
        throw new Error('스탬프 목록을 다시 불러오지 못했습니다.');
      }

      const data = (await stampResponse.json()) as MyStampResponse[];

      const nextStamps: Stamp[] = STAMP_REGIONS.map((regionName) => {
        const region = regions.find((item) => item.regionName === regionName);

        const ownedStamp = data.find((item) => item.regionName === regionName);

        return {
          id: region?.id ?? ownedStamp?.regionId ?? -1,

          region: regionName,

          owned: ownedStamp !== undefined,

          imageSrc: STAMP_IMAGE_MAP[regionName],
        };
      });

      setStamps(nextStamps);
    } catch (error) {
      console.error('스탬프 획득 실패:', error);

      /*
       * 위치 권한 오류
       */
      if (error instanceof GeolocationPositionError) {
        if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
          alert('스탬프를 획득하려면 위치 정보 권한을 허용해주세요.');
        } else if (error.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
          alert('현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.code === GeolocationPositionError.TIMEOUT) {
          alert('위치 확인 시간이 초과되었습니다. 다시 시도해주세요.');
        }

        return;
      }

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('스탬프 획득에 실패했습니다.');
      }
    } finally {
      setClaimingRegionId(null);
    }
  };

  /* =========================
     획득한 스탬프 개수
  ========================= */

  const ownedStampCount = stamps.filter((stamp) => stamp.owned).length;

  /* =========================
     경로 생성
  ========================= */

  const guidePoints = createGuidePoints(stamps.length);

  const denseCurve = createDenseCurve(guidePoints);

  const stampPoints = createStampPoints(denseCurve, stamps.length);

  const lastStamp = stampPoints[stampPoints.length - 1];

  /* =========================
     마지막 스탬프까지만
     연결선 표시
  ========================= */

  const displayCurve = lastStamp
    ? [...denseCurve.filter((point) => point.y < lastStamp.y), lastStamp]
    : denseCurve;

  /* =========================
     경로 높이
  ========================= */

  const pathHeight = (lastStamp?.y ?? START_POINT.y) + 100;

  const stampPath = createPath(displayCurve);

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
            상단 이미지
        ========================= */}

        <section className="stamp-tour-hero">
          <img src={stampTourImage} alt="" className="stamp-tour-hero__image" />

          <div className="stamp-tour-hero__info">
            <Typography variant="p1" className="stamp-tour-hero__description" color="#56504B">
              나의 스탬프
            </Typography>

            <Typography variant="head2" className="stamp-tour-hero__count" color="#56504B">
              {loading ? '-' : `${ownedStampCount}개`}
            </Typography>
          </div>
        </section>

        {/* =========================
            스탬프
        ========================= */}

        <section className="stamp-tour-stamps">
          {error ? (
            <div className="stamp-tour-error">
              <Typography variant="p2" color="#777777">
                {error}
              </Typography>
            </div>
          ) : (
            <div
              className="stamp-tour-path"
              style={{
                height: `${pathHeight}px`,
              }}
            >
              {/* =========================
                  연결선
              ========================= */}

              {stamps.length > 0 && (
                <svg
                  className="stamp-tour-path__line"
                  viewBox={`0 0 ${PATH_WIDTH} ${pathHeight}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d={stampPath} />
                </svg>
              )}

              {/* =========================
                  시작점
              ========================= */}

              <div
                className="stamp-tour-start"
                style={{
                  left: `${(START_POINT.x / PATH_WIDTH) * 100}%`,

                  top: `${START_POINT.y}px`,
                }}
              >
                <img
                  src={stampTourStartPoint}
                  alt="스탬프 투어 시작"
                  className="stamp-tour-start__image"
                />
              </div>

              {/* =========================
                  스탬프
              ========================= */}

              {stamps.map((stamp, index) => {
                const point = stampPoints[index];

                if (!point) {
                  return null;
                }

                const isClaiming = claimingRegionId === stamp.id;

                return (
                  <button
                    key={stamp.region}
                    type="button"
                    className={[
                      'stamp-tour-stamp',

                      stamp.owned ? 'stamp-tour-stamp--owned' : 'stamp-tour-stamp--locked',

                      !stamp.owned ? 'stamp-tour-stamp--clickable' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}

                    style={{
                      left: `${(point.x / PATH_WIDTH) * 100}%`,

                      top: `${point.y}px`,
                    }}

                    onClick={() => {
                      if (!stamp.owned && !isClaiming) {
                        void handleClaim(stamp);
                      }
                    }}

                    disabled={stamp.owned || claimingRegionId !== null}

                    aria-label={
                      stamp.owned
                        ? `${stamp.region} 스탬프 획득 완료`
                        : `${stamp.region} 스탬프 획득하기`
                    }
                  >
                    <div className="stamp-tour-stamp__mark">
                      <img
                        src={stamp.imageSrc}
                        alt={`${stamp.region} 스탬프`}
                        className="stamp-tour-stamp__image"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StampTourPage;
