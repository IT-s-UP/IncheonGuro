import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.png';
import MenuDrawer from '@/components/Menu/MenuDrawer';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/', { replace: true, state: { resetNavigation: true } });
  };

  const handleMenuClick = () => {
    setIsMenuOpen(true);
    onMenuClick?.();
  };

  return (
    <header className="header">
      <button
        type="button"
        className="header__logo-btn"
        onClick={handleLogoClick}
        aria-label="메인 화면으로 이동"
      >
        <img src={logo} alt="인천구로" className="header__logo" />
      </button>

      <div className="header__actions">
        <button
          type="button"
          className="header__menu-btn"
          onClick={handleMenuClick}
          aria-label="메뉴 열기"
        >
          <svg className="header__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}

export default Header;
