import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  { key: 'notification', icon: MegaphoneIcon, label: '알림' },
  { key: 'info', icon: InfoCircleIcon, label: '이용안내' },
];

const STAMP_SLOTS = [true, true, true, false, false, false, false, false, false];
const STAMP_PLACES = ['야생화단지', '개항로', '차이나타운'];

function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const navigate = useNavigate();

  const handleNavigate = (to?: string) => {
    if (!to) return;
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
          onClick={() => handleNavigate('/my-page')}
        >
          <span className="menu-drawer__avatar" aria-hidden="true" />
          <span className="menu-drawer__profile-text">
            <Typography variant="subtitle2">인천구로 탐험가 님</Typography>
            <Typography variant="subtitle3" color="#666666">
              동인천구 · 서해구
            </Typography>
          </span>
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
              30%
            </Typography>
            <div className="menu-drawer__progress-track">
              <div className="menu-drawer__progress-fill" />
            </div>
          </div>
          <div className="menu-drawer__progress-bottom">
            <div className="menu-drawer__stamp-row">
              {STAMP_SLOTS.map((filled, index) => (
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
              {STAMP_PLACES.join(' · ')}
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
          <button type="button" className="menu-drawer__stat">
            <Typography variant="p1" color="#123040">
              0
            </Typography>
            <Typography variant="p3" color="rgba(18, 48, 64, 0.68)">
              북마크
            </Typography>
          </button>
          <button
            type="button"
            className="menu-drawer__stat menu-drawer__stat--active"
            onClick={() => handleNavigate('/stamp-tour')}
          >
            <Typography variant="p1" color="#eeab73">
              2
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
      </aside>
    </div>
  );
}

export default MenuDrawer;
