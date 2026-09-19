import { useAuth } from '@/auth/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Compass } from 'lucide-react';

import { apiFetch } from '@/auth/api';
import { mascotImageOf, mascotKeyOfRegionName } from '@/assets/mascots';

import Typography from '@/components/Typography/Typography';
import {
  RouteIcon,
  FireworksIcon,
  CourseGuideIcon,
  MegaphoneIcon,
  InfoCircleIcon,
} from './MenuIcons';

import './MenuDrawer.css';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuRowItem {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  subtitle?: string;
  to?: string;
}

const MENU_GROUP_1: MenuRowItem[] = [
  {
    key: 'region',
    icon: Compass,
    label: '나의 GUMBTI',
    subtitle: '여행 성향 결과 다시 보기',
    to: '/region-recommend',
  },
  {
    key: 'course-recommend',
    icon: RouteIcon,
    label: '코스 추천',
    subtitle: '내 취향에 맞는 코스 추천받기',
    to: '/course-recommend',
  },
  {
    key: 'place-recommend',
    icon: MapPin,
    label: '장소 가이드',
    subtitle: '인천 곳곳의 장소 둘러보기',
    to: '/place-guide',
  },
  {
    key: 'course-guide',
    icon: CourseGuideIcon,
    label: '코스 가이드',
    subtitle: '인기 코스 둘러보기',
    to: '/course-guide',
  },
  {
    key: 'festival',
    icon: FireworksIcon,
    label: '축제 정보',
    subtitle: '이번 달 축제 모아보기',
    to: '/festivals',
  },
];

const MENU_GROUP_2: MenuRowItem[] = [
  {
    key: 'contact',
    icon: MegaphoneIcon,
    label: '문의하기',
    subtitle: '궁금한 점 남기기',
    to: '/contact',
  },
  {
    key: 'policies',
    icon: InfoCircleIcon,
    label: '약관 및 정책',
    subtitle: '이용약관 · 개인정보처리방침',
    to: '/policies',
  },
];

/* =========================
   스탬프
========================= */

const STAMP_TOTAL = 11;

/* =========================
   API 응답 타입
========================= */

interface MyPageResponse {
  data?: {
    interestedRegion?: number | null;
    interestedRegionName?: string | null;
    profileMascot?: string | null;
  };
}

interface MyPageStats {
  bookmarkCount: number;
}

interface MyStamp {
  regionId: number;
  regionName: string;
  imageUrl?: string | null;
  achievedAt?: string;
}

function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  /*
   * AuthContext에서 현재 로그인 사용자 정보를 가져옴
   *
   * 닉네임은 이제 별도의 nickname state를 사용하지 않고
   * user.nickname을 사용함.
   *
   * 마이페이지에서 updateUser({ nickname })을 호출하면
   * 이 user.nickname이 즉시 변경되기 때문에
   * 메뉴도 바로 다시 렌더링됨.
   */
  const { user } = useAuth();

  const isLoggedIn = user !== null;

  const navigate = useNavigate();

  /* =========================
     프로필 부가 정보

     닉네임은 AuthContext에서 관리하므로
     여기에는 저장하지 않음.
  ========================= */

  const [profileMascot, setProfileMascot] = useState<string | null>(null);

  const [interestedRegionName, setInterestedRegionName] = useState<string | null>(null);

  /* =========================
     마이페이지 부가 정보 조회

     닉네임은 조회하지 않고,
     관심 지역 / 프로필 마스코트만 사용
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) {
      setProfileMascot(null);
      setInterestedRegionName(null);
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
      .then((body: MyPageResponse | null) => {
        if (cancelled || !body?.data) {
          return;
        }

        const data = body.data;

        /* =========================
           관심 지역
        ========================= */

        const regionName = data.interestedRegionName ?? null;

        setInterestedRegionName(regionName);

        /* =========================
           프로필 마스코트

           직접 선택한 마스코트가 있으면 사용하고,
           없으면 관심 지역의 기본 마스코트 사용
        ========================= */

        const mascot = data.profileMascot ?? mascotKeyOfRegionName(regionName);

        setProfileMascot(mascot);
      })
      .catch(() => {
        if (!cancelled) {
          setProfileMascot(null);
          setInterestedRegionName(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isOpen]);

  /* =========================
     스탬프
  ========================= */

  const [myStamps, setMyStamps] = useState<MyStamp[]>([]);

  /* =========================
     북마크
  ========================= */

  const [bookmarkCount, setBookmarkCount] = useState(0);

  /* =========================
     내 코스
  ========================= */

  const [courseCount, setCourseCount] = useState(0);

  /* =========================
     다음 추천 지역
  ========================= */

  const [nextRegionName, setNextRegionName] = useState<string | null>(null);

  /* =========================
     스탬프 조회

     GET /stamp/my
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) {
      setMyStamps([]);
      return;
    }

    let cancelled = false;

    apiFetch('/stamp/my')
      .then((response) => {
        if (!response.ok) {
          return [];
        }

        return response.json();
      })
      .then((data: MyStamp[]) => {
        if (!cancelled) {
          setMyStamps(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMyStamps([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  /* =========================
     북마크 조회

     GET /api/mypage/stats
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) {
      setBookmarkCount(0);
      return;
    }

    let cancelled = false;

    apiFetch('/api/mypage/stats')
      .then((response) => {
        if (!response.ok) {
          return null;
        }

        return response.json();
      })
      .then((data: MyPageStats | null) => {
        if (cancelled || !data) {
          return;
        }

        setBookmarkCount(data.bookmarkCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) {
          setBookmarkCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  /* =========================
     내 코스 조회

     GET /api/courses
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) {
      setCourseCount(0);
      return;
    }

    let cancelled = false;

    apiFetch('/api/courses')
      .then((response) => {
        if (!response.ok) {
          return [];
        }

        return response.json();
      })
      .then((courses: unknown[]) => {
        if (cancelled) {
          return;
        }

        setCourseCount(Array.isArray(courses) ? courses.length : 0);
      })
      .catch(() => {
        if (!cancelled) {
          setCourseCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  /* =========================
     스탬프 개수 / 진행률
  ========================= */

  const ownedStampCount = isLoggedIn ? myStamps.length : 0;

  const stampPercent = Math.round((ownedStampCount / STAMP_TOTAL) * 100);

  const stampSlots = Array.from({ length: STAMP_TOTAL }, (_, index) => index < ownedStampCount);

  /* =========================
     다녀온 지역
  ========================= */

  const visitedRegionNames = myStamps
    .map((stamp) => stamp.regionName)
    .filter((name, index, array) => name && array.indexOf(name) === index);

  /* =========================
     아직 안 간 지역 중 랜덤 추천

     GET /api/region
  ========================= */

  useEffect(() => {
    if (!isLoggedIn) {
      setNextRegionName(null);
      return;
    }

    let cancelled = false;

    apiFetch('/api/region')
      .then((response) => {
        if (!response.ok) {
          return [];
        }

        return response.json();
      })
      .then(
        (
          regions: {
            id: number;
            regionName: string;
          }[],
        ) => {
          if (cancelled) {
            return;
          }

          if (!Array.isArray(regions)) {
            setNextRegionName(null);
            return;
          }

          /*
           * 내가 획득한 스탬프의 지역 ID
           */
          const visitedIds = new Set(myStamps.map((stamp) => stamp.regionId));

          /*
           * 아직 스탬프를 획득하지 않은 지역만
           */
          const unvisitedRegions = regions.filter((region) => !visitedIds.has(region.id));

          /*
           * 전부 방문했다면 추천하지 않음
           */
          if (unvisitedRegions.length === 0) {
            setNextRegionName(null);
            return;
          }

          /*
           * 미방문 지역 중 랜덤 선택
           */
          const randomIndex = Math.floor(Math.random() * unvisitedRegions.length);

          setNextRegionName(unvisitedRegions[randomIndex].regionName);
        },
      )
      .catch(() => {
        if (!cancelled) {
          setNextRegionName(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, myStamps]);

  /* =========================
     스탬프 안내 문구
  ========================= */

  const stampPlaceText =
    visitedRegionNames.length > 0
      ? `다녀온 곳 ${visitedRegionNames.join(' · ')}`
      : '다녀온 곳 없음';

  const stampRecommendationText = nextRegionName ? ` · 다음은 ${nextRegionName} 어때요?` : '';

  /* =========================
     프로필 이미지
  ========================= */

  const mascotImage = profileMascot ? mascotImageOf(profileMascot) : null;

  /* =========================
     페이지 이동
  ========================= */

  const handleNavigate = (to?: string) => {
    if (!to) {
      return;
    }

    onClose();
    navigate(to);
  };

  return (
    <div
      className={['menu-drawer-overlay', isOpen ? 'menu-drawer-overlay--open' : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <aside
        className="menu-drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* =========================
            헤더
        ========================= */}

        <div className="menu-drawer__back-header">
          <button
            type="button"
            className="menu-drawer__back-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            <ChevronLeft size={20} />
          </button>

          <Typography as="h2" variant="head2">
            메뉴
          </Typography>
        </div>

        {/* =========================
            프로필
        ========================= */}

        <button
          type="button"
          className="menu-drawer__profile"
          onClick={() => handleNavigate(isLoggedIn ? '/my-page' : '/login')}
        >
          <span className="menu-drawer__avatar">
            {isLoggedIn && mascotImage ? (
              <img src={mascotImage} alt="프로필 마스코트" className="menu-drawer__avatar-image" />
            ) : null}
          </span>

          {isLoggedIn ? (
            <span className="menu-drawer__profile-text">
              {/*
               * 닉네임은 AuthContext의 user.nickname 사용
               *
               * 마이페이지에서
               * updateUser({ nickname: 새로운닉네임 })
               * 을 호출하면 이 값이 즉시 변경됨
               */}
              <Typography variant="subtitle2">{user.nickname} 님</Typography>

              <Typography variant="subtitle3" color="#666666">
                {interestedRegionName ?? '관심 지역 없음'}
              </Typography>
            </span>
          ) : (
            <span className="menu-drawer__profile-text">
              <Typography variant="subtitle2">로그인 해주세요</Typography>
            </span>
          )}

          <ChevronRight size={20} className="menu-drawer__profile-arrow" />
        </button>

        {/* =========================
            스탬프 진행 카드
        ========================= */}

        <div className="menu-drawer__progress-card">
          <div className="menu-drawer__progress-top">
            <Typography
              variant="caption2"
              color="#ffffff"
              className="menu-drawer__progress-caption"
            >
              진행 중인 스탬프 투어
            </Typography>

            <Typography variant="subtitle2" color="#ffffff">
              스탬프 투어
            </Typography>

            <Typography variant="p3" color="#ffffff" className="menu-drawer__progress-percent">
              {stampPercent}%
            </Typography>

            <div className="menu-drawer__progress-track">
              <div
                className="menu-drawer__progress-fill"
                style={{
                  width: `${stampPercent}%`,
                }}
              />
            </div>
          </div>

          <div className="menu-drawer__progress-bottom">
            {/* 스탬프 11개 */}
            <div className="menu-drawer__stamp-row">
              {stampSlots.map((filled, index) => (
                <span
                  key={index}
                  className={[
                    'menu-drawer__stamp',
                    filled ? 'menu-drawer__stamp--filled' : 'menu-drawer__stamp--empty',
                  ].join(' ')}
                />
              ))}
            </div>

            {/* 다녀온 지역 + 다음 추천 지역 */}
            <Typography variant="p3" className="menu-drawer__progress-places">
              {isLoggedIn ? `${stampPlaceText}${stampRecommendationText}` : '다녀온 곳 없음'}
            </Typography>
          </div>
        </div>

        {/* =========================
            통계
        ========================= */}

        <div className="menu-drawer__stats">
          {/* 내 코스 */}
          <button
            type="button"
            className={['menu-drawer__stat', courseCount > 0 ? 'menu-drawer__stat--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleNavigate('/my-courses')}
          >
            <Typography variant="p1" color={courseCount > 0 ? '#eeab73' : '#123040'}>
              {isLoggedIn ? courseCount : 0}
            </Typography>

            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              내 코스
            </Typography>
          </button>

          {/* 북마크 */}
          <button
            type="button"
            className={['menu-drawer__stat', bookmarkCount > 0 ? 'menu-drawer__stat--active' : '']
              .filter(Boolean)
              .join(' ')}
            // onClick={() => handleNavigate('/bookmarks')}
            onClick={() => handleNavigate('/place-guide?tab=bookmark')}
          >
            <Typography variant="p1" color={bookmarkCount > 0 ? '#eeab73' : '#123040'}>
              {isLoggedIn ? bookmarkCount : 0}
            </Typography>

            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              북마크
            </Typography>
          </button>

          {/* 스탬프 */}
          <button
            type="button"
            className={['menu-drawer__stat', ownedStampCount > 0 ? 'menu-drawer__stat--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleNavigate('/stamp-tour')}
          >
            <Typography variant="p1" color={ownedStampCount > 0 ? '#eeab73' : '#123040'}>
              {isLoggedIn ? ownedStampCount : 0}
            </Typography>

            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              스탬프
            </Typography>
          </button>
        </div>

        {/* =========================
            메뉴 그룹 1
        ========================= */}

        <nav className="menu-drawer__group">
          {MENU_GROUP_1.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className="menu-drawer__row"
                onClick={() => handleNavigate(item.to)}
              >
                <Icon size={23} className="menu-drawer__row-icon" />

                <span className="menu-drawer__row-text">
                  <Typography variant="head3">{item.label}</Typography>

                  {item.subtitle && (
                    <Typography variant="subtitle3" color="#666666">
                      {item.subtitle}
                    </Typography>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* =========================
            메뉴 그룹 2
        ========================= */}

        <nav className="menu-drawer__group">
          {MENU_GROUP_2.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                className="menu-drawer__row"
                onClick={() => handleNavigate(item.to)}
              >
                <Icon size={23} className="menu-drawer__row-icon" />

                <span className="menu-drawer__row-text">
                  <Typography variant="head3">{item.label}</Typography>

                  {item.subtitle && (
                    <Typography variant="subtitle3" color="#666666">
                      {item.subtitle}
                    </Typography>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

export default MenuDrawer;
