import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import OptionTab from '@/components/Tab/OptionTab';
import Typography from '@/components/Typography/Typography';
import { apiFetch } from '@/auth/api';

import '../SignupPage/SignupPage.css';

type Step = 0 | 1;

const GENDER_OPTIONS = ['남성', '여성'];

interface RegionOption {
  id: number;
  regionName: string;
}

interface MyPageApiData {
  nickname: string;
  name: string | null;
  birth: string | null;
  gender: string | null;
  phoneNumber: string | null;
  interestedRegion: number | null;
}

function CompleteProfilePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');

  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiFetch('/api/mypage').then((response) => (response.ok ? response.json() : null)),
      fetch('/api/region').then((response) => (response.ok ? response.json() : [])),
    ])
      .then(([mypage, regionList]: [{ data: MyPageApiData } | null, RegionOption[]]) => {
        if (cancelled) return;

        if (mypage?.data) {
          const data = mypage.data;
          setNickname(data.nickname ?? '');
          setName(data.name ?? '');
          setGender(data.gender ?? '');
          setPhone(data.phoneNumber ?? '');
          if (data.birth) setBirth(data.birth.replaceAll('-', ''));
          if (data.interestedRegion) setRegionId(data.interestedRegion);
        }

        setRegions(regionList ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleNext = () => {
    if (!name || birth.length !== 8 || !gender || phone.length !== 13) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    setStep(1);
  };

  const handleFinish = async () => {
    if (regionId === null) {
      alert('관심 지역을 선택해주세요.');
      return;
    }

    try {
      const response = await apiFetch('/api/mypage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nickname,
          birth: `${birth.slice(0, 4)}-${birth.slice(4, 6)}-${birth.slice(6, 8)}`,
          gender,
          phoneNumber: phone,
          interestedRegion: regionId,
        }),
      });

      if (!response.ok) {
        throw new Error('정보 저장에 실패했습니다.');
      }

      navigate('/', { replace: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : '정보 저장에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="signup-page">
        <Header />
      </div>
    );
  }

  return (
    <div className="signup-page">
      <Header />

      <main className="signup-page__content">
        {step === 0 && (
          <section className="signup-step">
            <Typography as="h1" variant="p0" className="signup-title">
              자세한 정보를 알려주세요.
            </Typography>

            <Typography as="p" variant="p2" className="signup-description">
              소셜 로그인 계정에서 못 받아온 정보만 채워주세요.
            </Typography>

            <div className="signup-form">
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

              <div className="signup-field">
                <Typography as="label" variant="head3">
                  이메일
                </Typography>

                <Input variant="box" size="main" value="소셜 로그인 계정" disabled />
              </div>
            </div>

            <div className="signup-bottom-button">
              <Button size="middle" variant="primary" onClick={handleNext}>
                다음
              </Button>
            </div>
          </section>
        )}

        {step === 1 && (
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
              <Button size="middle" variant="primary" onClick={handleFinish}>
                완료
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default CompleteProfilePage;
