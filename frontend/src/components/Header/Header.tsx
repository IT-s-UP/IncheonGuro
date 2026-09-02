import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '@/assets/logo.png';
import MenuDrawer from '@/components/Menu/MenuDrawer';
import './Header.css';

interface HeaderProps {
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
}

function Header({ onNotificationClick, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
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
          className="header__notification-btn"
          onClick={onNotificationClick}
          aria-label="알림"
        >
          <svg className="header__vector" viewBox="0 0 29 32" fill="none" aria-hidden="true">
            <path
              d="M11.7474 28.695C12.001 29.1342 12.3656 29.4988 12.8048 29.7523C13.244 30.0059 13.7421 30.1394 14.2492 30.1394C14.7563 30.1394 15.2545 30.0059 15.6936 29.7523C16.1328 29.4988 16.4975 29.1342 16.751 28.695M1.6274 20.4991C1.4387 20.7059 1.31417 20.9631 1.26896 21.2394C1.22375 21.5157 1.25981 21.7992 1.37275 22.0553C1.48568 22.3115 1.67064 22.5294 1.90511 22.6823C2.13957 22.8353 2.41345 22.9169 2.69342 22.9171H25.805C26.0849 22.9172 26.3589 22.836 26.5935 22.6833C26.8281 22.5306 27.0133 22.313 27.1265 22.0569C27.2398 21.8009 27.2762 21.5175 27.2313 21.2412C27.1865 20.9649 27.0623 20.7076 26.8739 20.5005C24.9528 18.5201 22.9161 16.4155 22.9161 9.91685C22.9161 7.61826 22.0029 5.41381 20.3776 3.78846C18.7523 2.16311 16.5478 1.25 14.2492 1.25C11.9506 1.25 9.74618 2.16311 8.12083 3.78846C6.49548 5.41381 5.58237 7.61826 5.58237 9.91685C5.58237 16.4155 3.54421 18.5201 1.6274 20.4991Z"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

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
