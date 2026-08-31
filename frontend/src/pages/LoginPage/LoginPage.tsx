import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Typography from '@/components/Typography/Typography';

import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  /* =========================
     로그인
  ========================= */

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId || !password) {
      alert('ID와 비밀번호를 입력해주세요.');
      return;
    }

    /*
     * TODO
     *
     * 추후 로그인 API 연결
     *
     * await login({
     *   userId,
     *   password,
     * });
     */

    navigate('/');
  };

  /* =========================
     SNS 로그인
  ========================= */

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 API
    console.log('카카오 로그인');
  };

  const handleGoogleLogin = () => {
    // TODO: 구글 로그인 API
    console.log('구글 로그인');
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

            <Input
              type="password"
              variant="box"
              size="main"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
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

          <button type="button" className="login-sns__button" onClick={handleKakaoLogin}>
            카카오톡으로 회원가입/로그인
          </button>

          <button type="button" className="login-sns__button" onClick={handleGoogleLogin}>
            구글 계정으로 회원가입/로그인
          </button>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
