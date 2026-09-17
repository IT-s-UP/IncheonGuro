import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Typography from '@/components/Typography/Typography';
import { useAuth } from '@/auth/AuthContext';

import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [params] = useSearchParams();

  // RequireAuth가 비로그인 접근을 막으며 넘겨준, 원래 가려던 경로
  const redirectState = location.state as {
    from?: { pathname: string; search: string; hash: string };
  } | null;
  const redirectTo = redirectState?.from ?? '/';
  const error = params.get('error');
  const provider = error?.startsWith('google_') ? '구글' : '카카오';
  const loginError = !error
    ? ''
    : error.endsWith('_cancelled')
      ? provider + ' 로그인이 취소되었어요.'
      : error.endsWith('_state')
        ? '로그인 요청이 만료되었어요. 다시 시도해 주세요.'
        : provider + ' 로그인에 실패했어요. 다시 시도해 주세요.';

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* =========================
     로그인
  ========================= */

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !password) {
      alert('ID와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(userId, password);
      navigate(redirectTo);
    } catch (err) {
      alert(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  /* =========================
     SNS 로그인
  ========================= */

  const handleKakaoLogin = () => {
    window.location.assign('/api/auth/kakao');
  };

  const handleGoogleLogin = () => {
    window.location.assign('/api/auth/google');
  };

  return (
    <div className="login-page">
      <Header />

      <main className="login-page__content">
        <Typography as="h1" variant="p0" className="login-title">
          인천의 다양한 구를
          <br />
          경험해보세요.
        </Typography>

        {/* =========================
            로그인 FORM
        ========================= */}

        {loginError && <p role="alert">{loginError}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          {/* ID */}
          <div className="login-field">
            <Typography as="label" variant="head3">
              ID
            </Typography>

            <Input
              variant="box"
              size="main"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div className="login-field">
            <Typography as="label" variant="head3">
              비밀번호
            </Typography>

            <div className="login-password-input">
              <Input
                type={showPassword ? 'text' : 'password'}
                variant="box"
                size="main"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                className="login-password-eye"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <Button type="submit" size="middle" variant="primary" className="login-button">
            로그인
          </Button>
        </form>

        {/* =========================
            ID / PW 찾기, 회원가입
        ========================= */}

        <div className="login-links">
          <button type="button">ID / PW 찾기</button>

          <span className="login-links__divider" />

          <button type="button" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>

        {/* =========================
            SNS 로그인
        ========================= */}

        <section className="login-sns">
          <Typography as="h2" variant="subtitle2" className="login-sns__title">
            SNS 계정으로 로그인
          </Typography>

          <button
            type="button"
            className="login-sns__button login-sns__button--kakao"
            onClick={handleKakaoLogin}
          >
            <span className="login-sns__kakao-icon" aria-hidden="true" />
            카카오계정 로그인
          </button>

          <button
            type="button"
            className="login-sns__button login-sns__button--google"
            onClick={handleGoogleLogin}
          >
            <span className="login-sns__google-icon" aria-hidden="true">
              G
            </span>
            Google로 시작하기
          </button>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
