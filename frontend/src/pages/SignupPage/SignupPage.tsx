import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import Header from '@/components/Header/Header';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import OptionTab from '@/components/Tab/OptionTab';
import Typography from '@/components/Typography/Typography';

import signup1 from '@/assets/signup1.png';
import signup2 from '@/assets/signup2.png';
import {
  confirmEmailVerificationCode,
  isLoginIdAvailable,
  sendEmailVerificationCode,
  signup,
} from '@/auth/api';
import type { SignupPayload } from '@/auth/api';

import './SignupPage.css';

type SignupStep = 0 | 1 | 2 | 3 | 4 | 5;

const GENDER_OPTIONS = ['남', '여'];

interface RegionOption {
  id: number;
  regionName: string;
}

function SignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<SignupStep>(0);

  /* =========================
     1. 계정 정보
  ========================= */

  const [userId, setUserId] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  /* =========================
     2. 상세 정보
  ========================= */

  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');

  const [gender, setGender] = useState('');

  const [phone, setPhone] = useState('');

  const [emailId, setEmailId] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [emailDomainOption, setEmailDomainOption] = useState('');

  const [verificationCode, setVerificationCode] = useState('');

  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  /* 7분 = 420초 */
  const [verificationTime, setVerificationTime] = useState(0);

  /* =========================
     3. 닉네임
  ========================= */

  const [nickname, setNickname] = useState('');

  const isNicknameValid = /^[A-Za-z0-9가-힣ㄱ-ㅎ]{2,5}$/.test(nickname);

  /* =========================
     4. 관심 지역
  ========================= */

  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/region')
      .then((response) => (response.ok ? response.json() : []))
      .then((data: RegionOption[]) => {
        if (!cancelled) setRegions(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================
     5. 약관
  ========================= */

  const [ageAgree, setAgeAgree] = useState(false);
  const [locationAgree, setLocationAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);

  const allAgree = ageAgree && locationAgree && privacyAgree;

  /* =========================
     비밀번호 조건
  ========================= */

  const passwordRules = {
    length: password.length >= 8,
    english: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/.test(password),
  };

  const isPasswordValid =
    passwordRules.length && passwordRules.english && passwordRules.number && passwordRules.special;

  const isPasswordConfirmMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  /* =========================
     전화번호 자동 하이픈
  ========================= */

  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    let formatted = numbers;

    if (numbers.length > 3 && numbers.length <= 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    if (numbers.length > 7) {
      formatted = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }

    setPhone(formatted);
  };

  /* =========================
     ID 중복 확인
  ========================= */

  const handleIdCheck = async () => {
    if (!userId.trim()) {
      setIsIdChecked(false);
      setIdCheckMessage('ID를 입력해주세요.');
      return;
    }

    let available: boolean;

    try {
      available = await isLoginIdAvailable(userId);
    } catch (err) {
      setIsIdChecked(false);
      setIdCheckMessage(err instanceof Error ? err.message : 'ID 확인에 실패했습니다.');
      return;
    }

    if (!available) {
      setIsIdChecked(false);
      setIdCheckMessage('이미 사용 중인 ID입니다.');
      return;
    }

    setIsIdChecked(true);
    setIdCheckMessage('사용 가능한 ID입니다.');
  };

  /* =========================
     이메일 인증 초기화
  ========================= */

  const resetEmailVerification = () => {
    setVerificationCode('');
    setIsEmailCodeSent(false);
    setIsEmailVerified(false);
    setVerificationTime(0);
  };

  /* =========================
     이메일 인증
  ========================= */

  const handleEmailVerification = async () => {
    /*
     * 인증번호 최초 전송
     */
    if (!isEmailCodeSent) {
      if (!emailId || !emailDomain) {
        alert('이메일을 입력해주세요.');
        return;
      }

      try {
        await sendEmailVerificationCode(`${emailId}@${emailDomain}`);
      } catch (err) {
        alert(err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.');
        return;
      }

      setIsEmailCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');

      setVerificationTime(7 * 60);

      return;
    }

    /*
     * 인증시간 만료
     */
    if (verificationTime <= 0) {
      alert('인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.');
      return;
    }

    /*
     * 인증번호 확인
     */
    if (!verificationCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 6) {
      alert('인증번호 6자리를 입력해주세요.');
      return;
    }

    try {
      await confirmEmailVerificationCode(`${emailId}@${emailDomain}`, verificationCode);
    } catch (err) {
      alert(err instanceof Error ? err.message : '인증번호가 일치하지 않습니다.');
      return;
    }

    setIsEmailVerified(true);
    setVerificationTime(0);
  };

  /* =========================
     이메일 인증 재전송
  ========================= */

  const handleEmailResend = async () => {
    if (!emailId || !emailDomain) {
      return;
    }

    try {
      await sendEmailVerificationCode(`${emailId}@${emailDomain}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '인증번호 재전송에 실패했습니다.');
      return;
    }

    setVerificationCode('');
    setIsEmailVerified(false);
    setIsEmailCodeSent(true);

    /*
     * 다시 7분부터 시작
     */
    setVerificationTime(7 * 60);
  };

  /* =========================
     이메일 인증 타이머
  ========================= */

  useEffect(() => {
    if (!isEmailCodeSent || isEmailVerified || verificationTime <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVerificationTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isEmailCodeSent, isEmailVerified, verificationTime]);

  const formatVerificationTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);

    const remainSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
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

      if (!isPasswordValid) {
        alert('비밀번호 조건을 모두 충족해주세요.');
        return;
      }

      if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    if (step === 1) {
      if (!name || !birth || !gender || !phone || !emailId || !emailDomain) {
        alert('모든 정보를 입력해주세요.');
        return;
      }

      if (phone.length !== 13) {
        alert('전화번호를 정확하게 입력해주세요.');
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
      if (regionId === null) {
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

  const handleSignup = async () => {
    if (!allAgree) {
      alert('필수 약관에 모두 동의해주세요.');
      return;
    }

    if (regionId === null) {
      alert('관심 지역을 선택해주세요.');
      return;
    }

    const payload: SignupPayload = {
      loginId: userId,
      password,
      phoneNumber: phone,
      name,
      birth: `${birth.slice(0, 4)}-${birth.slice(4, 6)}-${birth.slice(6, 8)}`,
      gender,
      email: `${emailId}@${emailDomain}`,
      nickname,
      interestedRegion: regionId,
    };

    try {
      await signup(payload);
    } catch (err) {
      alert(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
      return;
    }

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
              {/* ID */}

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  ID
                </Typography>

                <div className="signup-id-area">
                  <div className="signup-inline">
                    <Input
                      variant="box"
                      size="middle"
                      value={userId}
                      placeholder="ID를 입력하세요."
                      onChange={(event) => {
                        /*
                         * 영문 + 숫자만 허용
                         */
                        const value = event.target.value.replace(/[^A-Za-z0-9]/g, '');

                        setUserId(value);

                        /*
                         * ID 수정 시
                         * 기존 중복확인 결과 초기화
                         */
                        setIsIdChecked(false);
                        setIdCheckMessage('');
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

                  {idCheckMessage && (
                    <Typography
                      variant="caption1"
                      className={[
                        'signup-id-message',
                        isIdChecked ? 'signup-id-message--success' : 'signup-id-message--error',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {idCheckMessage}
                    </Typography>
                  )}
                </div>
              </div>

              {/* 비밀번호 */}

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  비밀번호
                </Typography>

                <div className="signup-password-input">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    variant="box"
                    size="main"
                    value={password}
                    placeholder="비밀번호를 입력하세요."
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <button
                    type="button"
                    className="signup-password-eye"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                  </button>
                </div>

                <div className="signup-password-rules">
                  <Typography
                    variant="caption1"
                    className={[
                      'signup-password-rule',
                      passwordRules.length ? 'signup-password-rule--valid' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    ○ 8자 이상
                  </Typography>

                  <Typography
                    variant="caption1"
                    className={[
                      'signup-password-rule',
                      passwordRules.english ? 'signup-password-rule--valid' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    ○ 영문 포함
                  </Typography>

                  <Typography
                    variant="caption1"
                    className={[
                      'signup-password-rule',
                      passwordRules.number ? 'signup-password-rule--valid' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    ○ 숫자 포함
                  </Typography>

                  <Typography
                    variant="caption1"
                    className={[
                      'signup-password-rule',
                      passwordRules.special ? 'signup-password-rule--valid' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    ○ 특수문자 포함
                  </Typography>
                </div>
              </div>

              {/* 비밀번호 재입력 */}

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  비밀번호 재입력
                </Typography>

                <div className="signup-password-input">
                  <Input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    variant="box"
                    size="main"
                    value={passwordConfirm}
                    placeholder="비밀번호를 다시 입력하세요."
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                  />

                  <button
                    type="button"
                    className="signup-password-eye"
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPasswordConfirm ? <Eye size={19} /> : <EyeOff size={19} />}
                  </button>
                </div>

                {isPasswordConfirmMismatch && (
                  <Typography variant="caption1" className="signup-password-error">
                    비밀번호가 일치하지 않습니다
                  </Typography>
                )}
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
                  placeholder="이름을 입력해주세요"
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
                    onChange={(event) =>
                      setBirth(event.target.value.replace(/\D/g, '').slice(0, 8))
                    }
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

                <Input
                  variant="box"
                  size="main"
                  inputMode="numeric"
                  maxLength={13}
                  value={phone}
                  placeholder="010-0000-0000"
                  onChange={(event) => handlePhoneChange(event.target.value)}
                />
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

                  {emailDomainOption === 'direct' ? (
                    <Input
                      variant="box"
                      size="small"
                      value={emailDomain}
                      placeholder="도메인 입력"
                      onChange={(event) => {
                        const value = event.target.value.replace(/@/g, '').replace(/\s/g, '');

                        setEmailDomain(value);

                        resetEmailVerification();
                      }}
                    />
                  ) : (
                    <select
                      className="signup-email-select"
                      value={emailDomainOption}
                      onChange={(event) => {
                        const selectedValue = event.target.value;

                        setEmailDomainOption(selectedValue);

                        if (selectedValue === 'direct') {
                          setEmailDomain('');
                        } else {
                          setEmailDomain(selectedValue);
                        }

                        resetEmailVerification();
                      }}
                    >
                      <option value="">선택</option>

                      <option value="naver.com">naver.com</option>

                      <option value="gmail.com">gmail.com</option>

                      <option value="daum.net">daum.net</option>

                      <option value="kakao.com">kakao.com</option>

                      <option value="direct">직접 입력</option>
                    </select>
                  )}
                </div>

                {/* =========================
                    이메일 인증
                ========================= */}

                <div className="signup-verify-row">
                  {/* 인증번호 + 재전송 */}

                  <div className="signup-verify-input-area">
                    <Input
                      variant="box"
                      size="main"
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

                    {isEmailCodeSent && !isEmailVerified && (
                      <button
                        type="button"
                        className="signup-email-resend"
                        onClick={handleEmailResend}
                      >
                        인증번호 재전송
                      </button>
                    )}
                  </div>

                  {/* 인증버튼 + 타이머 */}

                  <div className="signup-verify-action-area">
                    {!isEmailVerified && (
                      <Button
                        size="small"
                        variant="primary"
                        className="signup-small-button"
                        onClick={handleEmailVerification}
                      >
                        {isEmailCodeSent ? '인증 확인' : '인증하기'}
                      </Button>
                    )}

                    {isEmailCodeSent && !isEmailVerified && (
                      <div className="signup-verification-timer">
                        <Typography
                          variant="caption1"
                          color={verificationTime > 0 ? '#78AAC3' : '#E05555'}
                        >
                          {verificationTime > 0
                            ? formatVerificationTime(verificationTime)
                            : '인증 시간이 만료되었습니다.'}
                        </Typography>
                      </div>
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
                  placeholder="닉네임을 입력하세요."
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
              {regions.map((option) => (
                <OptionTab
                  key={option.id}
                  label={option.regionName}
                  size="small"
                  active={regionId === option.id}
                  onClick={() => setRegionId(option.id)}
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
