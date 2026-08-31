import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import OptionTab from '@/components/Tab/OptionTab';
import Typography from '@/components/Typography/Typography';

import signup1 from '@/assets/signup1.png';
import signup2 from '@/assets/signup2.png';

import './SignupPage.css';

type SignupStep = 0 | 1 | 2 | 3 | 4 | 5;

const GENDER_OPTIONS = ['남', '여'];

const REGION_OPTIONS = [
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
  '없음',
];

/* 프론트 테스트용 이메일 인증번호 */
const MOCK_VERIFICATION_CODE = '123456';

function SignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<SignupStep>(0);

  /* =========================
     1. 계정 정보
  ========================= */

  const [userId, setUserId] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  /* =========================
     2. 상세 정보
  ========================= */

  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');

  const [gender, setGender] = useState('');

  const [phoneMiddle, setPhoneMiddle] = useState('');
  const [phoneLast, setPhoneLast] = useState('');

  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('');

  const [verificationCode, setVerificationCode] = useState('');

  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  /* =========================
     3. 닉네임
  ========================= */

  const [nickname, setNickname] = useState('');

  const isNicknameValid = /^[A-Za-z0-9가-힣ㄱ-ㅎ]{2,5}$/.test(nickname);

  /* =========================
     4. 관심 지역
  ========================= */

  const [region, setRegion] = useState('');

  /* =========================
     5. 약관
  ========================= */

  const [ageAgree, setAgeAgree] = useState(false);
  const [locationAgree, setLocationAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);

  const allAgree = ageAgree && locationAgree && privacyAgree;

  /* =========================
     ID 중복 확인
  ========================= */

  const handleIdCheck = () => {
    if (!userId.trim()) {
      alert('ID를 입력해주세요.');
      return;
    }

    // TODO: 추후 ID 중복 확인 API 연결
    setIsIdChecked(true);

    alert('사용 가능한 ID입니다.');
  };

  /* =========================
     이메일 정보 변경 시
     기존 인증 초기화
  ========================= */

  const resetEmailVerification = () => {
    setVerificationCode('');
    setIsEmailCodeSent(false);
    setIsEmailVerified(false);
  };

  /* =========================
     이메일 인증
  ========================= */

  const handleEmailVerification = () => {
    if (!isEmailCodeSent) {
      if (!emailId || !emailDomain) {
        alert('이메일을 입력해주세요.');
        return;
      }

      // TODO: 추후 이메일 인증번호 전송 API 연결
      setIsEmailCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');

      alert('인증번호가 전송되었습니다.\n테스트 인증번호는 123456입니다.');

      return;
    }

    if (!verificationCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 6) {
      alert('인증번호 6자리를 입력해주세요.');
      return;
    }

    if (verificationCode !== MOCK_VERIFICATION_CODE) {
      alert('인증번호가 일치하지 않습니다.');
      return;
    }

    setIsEmailVerified(true);
  };

  /* =========================
     다음 단계
  ========================= */

  const handleNext = () => {
    if (step === 0) {
      if (!userId || !password || !passwordConfirm) {
        alert('모든 항목을 입력해주세요.');
        return;
      }

      if (!isIdChecked) {
        alert('ID 중복 확인을 해주세요.');
        return;
      }

      if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    if (step === 1) {
      if (!name || !birth || !gender || !phoneMiddle || !phoneLast || !emailId || !emailDomain) {
        alert('모든 정보를 입력해주세요.');
        return;
      }

      if (!isEmailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
      }
    }

    if (step === 2) {
      if (!isNicknameValid) {
        alert('닉네임은 한글, 영문, 숫자를 사용해 2~5자로 입력해주세요.');
        return;
      }
    }

    if (step === 3) {
      if (!region) {
        alert('관심 지역을 선택해주세요.');
        return;
      }
    }

    if (step < 5) {
      setStep((prev) => (prev + 1) as SignupStep);
    }
  };

  /* =========================
     전체 동의
  ========================= */

  const handleAllAgree = () => {
    const nextValue = !allAgree;

    setAgeAgree(nextValue);
    setLocationAgree(nextValue);
    setPrivacyAgree(nextValue);
  };

  /* =========================
     회원가입 완료
  ========================= */

  const handleSignup = () => {
    if (!allAgree) {
      alert('필수 약관에 모두 동의해주세요.');
      return;
    }

    /*
     * 추후 API 연결
     *
     * const request = {
     *   userId,
     *   password,
     *   name,
     *   birth,
     *   gender,
     *   phone: `010-${phoneMiddle}-${phoneLast}`,
     *   email: `${emailId}@${emailDomain}`,
     *   nickname,
     *   region,
     * };
     */

    setStep(5);
  };

  return (
    <div className="signup-page">
      <Header />

      <main className="signup-page__content">
        {/* =========================
            STEP 0
            계정 정보
        ========================= */}

        {step === 0 && (
          <section className="signup-step">
            <Typography as="h1" variant="p0" className="signup-title">
              회원가입
            </Typography>

            <div className="signup-form signup-form--account">
              <div className="signup-field">
                <Typography as="label" variant="head3">
                  ID
                </Typography>

                <div className="signup-inline">
                  <Input
                    variant="box"
                    size="middle"
                    value={userId}
                    placeholder="텍스트를 입력하세요."
                    onChange={(event) => {
                      setUserId(event.target.value);

                      setIsIdChecked(false);
                    }}
                  />

                  <Button
                    size="small"
                    variant="primary"
                    className="signup-small-button"
                    onClick={handleIdCheck}
                  >
                    중복 확인
                  </Button>
                </div>
              </div>

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  비밀번호
                </Typography>

                <Input
                  type="password"
                  variant="box"
                  size="main"
                  value={password}
                  placeholder="비밀번호를 입력하세요."
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  비밀번호 재입력
                </Typography>

                <Input
                  type="password"
                  variant="box"
                  size="main"
                  value={passwordConfirm}
                  placeholder="비밀번호를 다시 입력하세요."
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                />
              </div>
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" onClick={handleNext}>
                다음
              </Button>
            </div>
          </section>
        )}

        {/* =========================
            STEP 1
            상세 정보
        ========================= */}

        {step === 1 && (
          <section className="signup-step">
            <Typography as="h1" variant="p0" className="signup-title">
              자세한 정보를 알려주세요.
            </Typography>

            <div className="signup-form">
              {/* 이름 */}

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  이름
                </Typography>

                <Input
                  variant="box"
                  size="main"
                  value={name}
                  placeholder="텍스트를 입력하세요."
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              {/* 생년월일 + 성별 */}

              <div className="signup-detail-row">
                <div className="signup-field signup-birth-field">
                  <Typography as="label" variant="head3">
                    생년월일
                  </Typography>

                  <Input
                    variant="box"
                    size="small"
                    inputMode="numeric"
                    maxLength={8}
                    value={birth}
                    placeholder="YYYYMMDD"
                    onChange={(event) => setBirth(event.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="signup-field signup-gender-field">
                  <Typography as="label" variant="head3">
                    성별
                  </Typography>

                  <div className="signup-gender-options">
                    {GENDER_OPTIONS.map((option) => (
                      <Button
                        key={option}
                        size="small"
                        variant="primary"
                        className={[
                          'signup-gender-button',
                          gender === option ? 'signup-gender-button--active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setGender(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 전화번호 */}

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  전화번호
                </Typography>

                <div className="signup-phone-row">
                  <Typography variant="p0">010</Typography>

                  <span>-</span>

                  <Input
                    variant="box"
                    size="mini"
                    inputMode="numeric"
                    maxLength={4}
                    value={phoneMiddle}
                    onChange={(event) => setPhoneMiddle(event.target.value.replace(/\D/g, ''))}
                  />

                  <span>-</span>

                  <Input
                    variant="box"
                    size="mini"
                    inputMode="numeric"
                    maxLength={4}
                    value={phoneLast}
                    onChange={(event) => setPhoneLast(event.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              {/* 이메일 */}

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  이메일
                </Typography>

                <div className="signup-email-row">
                  <Input
                    variant="box"
                    size="small"
                    value={emailId}
                    placeholder="이메일 아이디"
                    onChange={(event) => {
                      setEmailId(event.target.value);

                      resetEmailVerification();
                    }}
                  />

                  <span>@</span>

                  <select
                    className="signup-email-select"
                    value={emailDomain}
                    onChange={(event) => {
                      setEmailDomain(event.target.value);

                      resetEmailVerification();
                    }}
                  >
                    <option value="">선택</option>

                    <option value="naver.com">naver.com</option>

                    <option value="gmail.com">gmail.com</option>

                    <option value="daum.net">daum.net</option>

                    <option value="kakao.com">kakao.com</option>
                  </select>
                </div>

                {/* 이메일 인증 */}

                <div className="signup-verify-row">
                  <Input
                    variant="box"
                    size="middle"
                    inputMode="numeric"
                    maxLength={6}
                    value={isEmailVerified ? '인증 완료' : verificationCode}
                    placeholder="인증번호 6자리"
                    readOnly={!isEmailCodeSent || isEmailVerified}
                    onChange={(event) => {
                      if (isEmailVerified) {
                        return;
                      }

                      setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                    }}
                  />

                  <div className="signup-verify-button-area">
                    {!isEmailVerified && (
                      <Button
                        size="small"
                        variant="primary"
                        className="signup-small-button"
                        onClick={handleEmailVerification}
                      >
                        {isEmailCodeSent ? '인증 완료' : '인증하기'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" onClick={handleNext}>
                다음
              </Button>
            </div>
          </section>
        )}

        {/* =========================
            STEP 2
            닉네임
        ========================= */}

        {step === 2 && (
          <section className="signup-step">
            <div>
              <Typography as="h1" variant="p0" className="signup-title">
                닉네임을 정해주세요.
              </Typography>

              <Typography as="p" variant="p2" className="signup-description">
                앞으로 정하신 닉네임으로 불러드릴게요!
                <br />
                닉네임은 나중에 수정 가능해요.
              </Typography>
            </div>

            <div className="signup-nickname-area">
              <div className="signup-field">
                <Typography as="label" variant="head3">
                  닉네임
                </Typography>

                <Input
                  variant="box"
                  size="main"
                  value={nickname}
                  placeholder="텍스트를 입력하세요."
                  onChange={(event) => setNickname(event.target.value)}
                />

                <Typography
                  variant="caption1"
                  color={nickname && !isNicknameValid ? '#e05555' : '#828585'}
                >
                  영문, 한글, 숫자 2~5자 이내, 특수기호 불가
                </Typography>
              </div>
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" onClick={handleNext}>
                다음
              </Button>
            </div>
          </section>
        )}

        {/* =========================
            STEP 3
            관심 지역
        ========================= */}

        {step === 3 && (
          <section className="signup-step">
            <div>
              <Typography as="h1" variant="p0" className="signup-title">
                관심 있는 구/군을 선택해주세요.
              </Typography>

              <Typography as="p" variant="p2" className="signup-description">
                관심 있는 지역에 대한 코스와 장소를 추천해드려요.
              </Typography>
            </div>

            <div className="signup-region-grid">
              {REGION_OPTIONS.map((option) => (
                <OptionTab
                  key={option}
                  label={option}
                  size="small"
                  active={region === option}
                  onClick={() => setRegion(option)}
                />
              ))}
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" onClick={handleNext}>
                다음
              </Button>
            </div>
          </section>
        )}

        {/* =========================
            STEP 4
            약관 동의
        ========================= */}

        {step === 4 && (
          <section className="signup-step">
            <Typography as="h1" variant="p0" className="signup-title">
              약관동의
            </Typography>

            <div className="signup-terms">
              <label className="signup-all-agree">
                <input type="checkbox" checked={allAgree} onChange={handleAllAgree} />

                <span className="signup-check" />

                <Typography variant="subtitle1">전체 동의</Typography>
              </label>

              <div className="signup-terms-divider" />

              <label className="signup-term-row">
                <input
                  type="checkbox"
                  checked={ageAgree}
                  onChange={(event) => setAgeAgree(event.target.checked)}
                />

                <span className="signup-check" />

                <Typography variant="head3" className="signup-term-required">
                  필수
                </Typography>

                <Typography variant="p2">만 15세 이상입니다.</Typography>
              </label>

              <label className="signup-term-row">
                <input
                  type="checkbox"
                  checked={locationAgree}
                  onChange={(event) => setLocationAgree(event.target.checked)}
                />

                <span className="signup-check" />

                <Typography variant="head3" className="signup-term-required">
                  필수
                </Typography>

                <Typography variant="p2">위치 정보 수집 및 이용에 동의합니다.</Typography>
              </label>

              <label className="signup-term-row">
                <input
                  type="checkbox"
                  checked={privacyAgree}
                  onChange={(event) => setPrivacyAgree(event.target.checked)}
                />

                <span className="signup-check" />

                <Typography variant="head3" className="signup-term-required">
                  필수
                </Typography>

                <Typography variant="p2">개인 정보 수집 및 이용에 동의합니다.</Typography>
              </label>
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" disabled={!allAgree} onClick={handleSignup}>
                가입 완료
              </Button>
            </div>
          </section>
        )}

        {/* =========================
            STEP 5
            가입 완료
        ========================= */}

        {step === 5 && (
          <section className="signup-step signup-complete">
            <Typography as="h1" variant="p0">
              {nickname || 'OOO'} 님,
              <br />
              함께 인천을 경험해보세요!
            </Typography>

            <div className="signup-complete-images">
              <div className="signup-complete-image signup-complete-image--back">
                <img src={signup1} alt="인천 이미지" />
              </div>

              <div className="signup-complete-image signup-complete-image--front">
                <img src={signup2} alt="회원가입 완료 이미지" />
              </div>
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" onClick={() => navigate('/')}>
                홈으로
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default SignupPage;
