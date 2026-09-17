import { useAuth } from '@/auth/AuthContext';
import { useEffect, useState } from 'react'; // [수정] useEffect, useState 추가
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { apiFetch } from '@/auth/api'; // [추가] 북마크 개수 조회용

import Typography from '@/components/Typography/Typography';
import {
  LocationPinIcon,
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
  { key: 'region', icon: LocationPinIcon, label: '지역 추천', to: '/region-recommend' },
  { key: 'course-recommend', icon: RouteIcon, label: '코스 추천', to: '/course-recommend' },
  {
    key: 'festival',
    icon: FireworksIcon,
    label: '축제 정보',
    subtitle: '이번 달 축제 모아보기',
    to: '/festivals',
  },
  {
    key: 'course-guide',
    icon: CourseGuideIcon,
    label: '코스 가이드',
    subtitle: '인기 코스 둘러보기',
    to: '/course-guide',
  },
];

const MENU_GROUP_2: MenuRowItem[] = [
  { key: 'contact', icon: MegaphoneIcon, label: '문의하기', to: '/contact' },
  { key: 'policies', icon: InfoCircleIcon, label: '약관 및 정책', to: '/policies' },
];

const STAMP_TOTAL = 9;
const STAMP_OWNED = 3;
const STAMP_PLACES = ['야생화단지', '개항로', '차이나타운'];

// [추가] GET /api/mypage/stats 응답 형태
// GET /api/mypage/stats 응답 형태
interface MyPageStats {
  bookmarkCount: number;
}

function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  const navigate = useNavigate();

  // [추가] 북마크 개수 - /api/mypage/stats에서 실제 값 조회
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      setBookmarkCount(0);
      return;
    }

    let cancelled = false;

    apiFetch('/api/mypage/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MyPageStats | null) => {
        if (!cancelled && data) {
          setBookmarkCount(data.bookmarkCount);
        }
      })
      .catch(() => {
        // 실패해도 0으로 유지
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]); // [추가] 전체 useEffect 블록

  const handleNavigate = (to?: string) => {
    if (!to) return;
    onClose();
    navigate(to);
  };

  const ownedStampCount = isLoggedIn ? STAMP_OWNED : 0;
  const stampPercent = Math.round((ownedStampCount / STAMP_TOTAL) * 100);
  const stampSlots = Array.from({ length: STAMP_TOTAL }, (_, index) => index < ownedStampCount);

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

        <button
          type="button"
          className="menu-drawer__profile"
          onClick={() => handleNavigate(isLoggedIn ? '/my-page' : '/login')}
        >
          <span className="menu-drawer__avatar" aria-hidden="true" />
          {isLoggedIn ? (
            <span className="menu-drawer__profile-text">
              <Typography variant="subtitle2">{user?.nickname} 님</Typography>
              <Typography variant="subtitle3" color="#666666">
                동인천구 · 서해구
              </Typography>
            </span>
          ) : (
            <span className="menu-drawer__profile-text">
              <Typography variant="subtitle2">로그인 해주세요</Typography>
            </span>
          )}
          <ChevronRight size={20} className="menu-drawer__profile-arrow" />
        </button>

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
              <div className="menu-drawer__progress-fill" style={{ width: `${stampPercent}%` }} />
            </div>
          </div>
          <div className="menu-drawer__progress-bottom">
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
            <Typography variant="p3" className="menu-drawer__progress-places">
              {isLoggedIn ? STAMP_PLACES.join(' · ') : '아직 모은 스탬프가 없어요'}
            </Typography>
          </div>
        </div>

        <div className="menu-drawer__stats">
          <button
            type="button"
            className="menu-drawer__stat"
            onClick={() => handleNavigate('/my-courses')}
          >
            <Typography variant="p1" color="#123040">
              0
            </Typography>
            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              내 코스
            </Typography>
          </button>
          <button
            type="button"
            className="menu-drawer__stat"
            onClick={() => handleNavigate('/bookmarks')}
          >
            <Typography variant="p1" color="#123040">
              {bookmarkCount} {/* [수정] 하드코딩된 0 -> 실제 API 값 */}
            </Typography>
            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              북마크
            </Typography>
          </button>
          <button
            type="button"
            className={['menu-drawer__stat', isLoggedIn ? 'menu-drawer__stat--active' : ''].join(
              ' ',
            )}
            onClick={() => handleNavigate('/stamp-tour')}
          >
            <Typography variant="p1" color={isLoggedIn ? '#eeab73' : '#123040'}>
              {ownedStampCount}
            </Typography>
            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              스탬프
            </Typography>
          </button>
        </div>

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
                </span>
              </button>
            );
          })}
        </nav>
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => {
              void logout()
                .then(() => handleNavigate('/login'))
                .catch(() => alert('로그아웃에 실패했어요. 다시 시도해 주세요.'));
            }}
          >
            로그아웃
          </button>
        )}
      </aside>
    </div>
  );
}

export default MenuDrawer;
