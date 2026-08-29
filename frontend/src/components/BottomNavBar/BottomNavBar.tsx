import './BottomNavBar.css';

interface NavItem {
  key: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '메인' },
  { key: 'exchange', label: '환율조회' },
  { key: 'smart-map', label: '스마트맵' },
  { key: 'group-pay', label: '공동송금' },
];

interface BottomNavBarProps {
  active?: string;
  onNavigate?: (key: string) => void;
}

function BottomNavBar({ active = 'home', onNavigate }: BottomNavBarProps) {
  return (
    <nav className="bottom-nav-bar">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          className="bottom-nav-bar__item"
          onClick={() => onNavigate?.(item.key)}
          aria-current={active === item.key ? 'page' : undefined}
        >
          <span
            className={[
              'bottom-nav-bar__icon',
              `bottom-nav-bar__icon--${item.key}`,
              active === item.key ? 'bottom-nav-bar__icon--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden="true"
          />
          <span className="bottom-nav-bar__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNavBar;
