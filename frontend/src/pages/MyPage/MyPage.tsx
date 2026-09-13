import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pencil } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Typography from '@/components/Typography/Typography';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import { apiFetch } from '@/auth/api';
import { mascotImageOf } from '@/assets/mascots';
import NameSheet from './sheets/NameSheet';
import NicknameSheet from './sheets/NicknameSheet';
import BirthdateSheet from './sheets/BirthdateSheet';
import type { Birthdate } from './sheets/BirthdateSheet';
import GenderSheet from './sheets/GenderSheet';
import type { Gender } from './sheets/GenderSheet';
import PhoneSheet from './sheets/PhoneSheet';
import RegionSheet from './sheets/RegionSheet';
import type { RegionValue } from './sheets/RegionSheet';
import EmailSheet from './sheets/EmailSheet';
import type { EmailValue } from './sheets/EmailSheet';
import PasswordSheet from './sheets/PasswordSheet';
import MascotSheet from './sheets/MascotSheet';
import './MyPage.css';

type FieldKey =
  | 'name'
  | 'nickname'
  | 'birthdate'
  | 'gender'
  | 'phone'
  | 'region'
  | 'email'
  | 'password'
  | 'mascot';

const FIELDS_GROUP_1: { key: FieldKey; label: string }[] = [
  { key: 'name', label: '이름' },
  { key: 'birthdate', label: '생년월일' },
  { key: 'gender', label: '성별' },
  { key: 'phone', label: '전화번호' },
  { key: 'region', label: '관심 구/군' },
];

const FIELDS_GROUP_2: { key: FieldKey; label: string }[] = [
  { key: 'email', label: '이메일' },
  { key: 'password', label: '비밀번호' },
];

interface ProfileState {
  name: string;
  nickname: string;
  birthdate: Birthdate;
  gender: Gender;
  phone: string;
  interestedRegion: RegionValue;
  email: EmailValue;
  socialAccount: boolean;
}

interface MyPageApiData {
  nickname: string;
  name: string;
  birth: string | null;
  gender: string | null;
  phoneNumber: string | null;
  email: string | null;
  interestedRegion: number | null;
  interestedRegionName: string | null;
  profileMascot: string | null;
  socialAccount: boolean;
}

const INITIAL_PROFILE: ProfileState = {
  name: '',
  nickname: '탐험가',
  birthdate: { year: 2000, month: 1, day: 1 },
  gender: '남성',
  phone: '',
  interestedRegion: { id: null, name: '없음' },
  email: { id: '', domain: 'gmail.com' },
  socialAccount: false,
};

function splitEmail(email: string | null): EmailValue {
  if (!email) return { id: '', domain: 'gmail.com' };
  const [id, domain] = email.split('@');
  return { id: id ?? '', domain: domain ?? '' };
}

function joinEmail(value: EmailValue) {
  return `${value.id}@${value.domain}`;
}

function birthToBirthdate(birth: string | null): Birthdate {
  if (!birth) return INITIAL_PROFILE.birthdate;
  const [year, month, day] = birth.split('-').map(Number);
  return { year, month, day };
}

function birthdateToBirth(value: Birthdate) {
  const month = String(value.month).padStart(2, '0');
  const day = String(value.day).padStart(2, '0');
  return `${value.year}-${month}-${day}`;
}

async function readErrorMessage(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return (body?.message as string | undefined) ?? fallback;
}

function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [openField, setOpenField] = useState<FieldKey | null>(null);
  const [mascot, setMascot] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/mypage')
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { data: MyPageApiData } | null) => {
        if (cancelled || !body) return;
        const data = body.data;

        setProfile({
          name: data.name ?? '',
          nickname: data.nickname,
          birthdate: birthToBirthdate(data.birth),
          gender: (data.gender as Gender) || INITIAL_PROFILE.gender,
          phone: data.phoneNumber ?? '',
          interestedRegion: {
            id: data.interestedRegion,
            name: data.interestedRegionName ?? '없음',
          },
          email: splitEmail(data.email),
          socialAccount: data.socialAccount,
        });

        setMascot(data.profileMascot);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const closeSheet = () => setOpenField(null);

  const getFieldValue = (key: FieldKey): string => {
    switch (key) {
      case 'name':
        return profile.name || '미입력';
      case 'nickname':
        return profile.nickname;
      case 'birthdate':
        return `${profile.birthdate.year}년 ${profile.birthdate.month}월 ${profile.birthdate.day}일`;
      case 'gender':
        return profile.gender;
      case 'phone':
        return profile.phone || '미입력';
      case 'region':
        return profile.interestedRegion.name;
      case 'email':
        return '변경하기';
      case 'password':
        return '변경하기';
      default:
        return '';
    }
  };

  const handleSave = async () => {
    if (profile.interestedRegion.id === null) {
      alert('관심 구/군을 선택해주세요.');
      return;
    }

    try {
      const response = await apiFetch('/api/mypage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          nickname: profile.nickname,
          birth: birthdateToBirth(profile.birthdate),
          gender: profile.gender,
          phoneNumber: profile.phone,
          interestedRegion: profile.interestedRegion.id,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, '내 정보 저장에 실패했습니다.'));
      }

      navigate(-1);
    } catch (err) {
      alert(err instanceof Error ? err.message : '내 정보 저장에 실패했습니다.');
    }
  };

  const handleMascotSave = async (nextMascot: string) => {
    try {
      const response = await apiFetch('/api/mypage/profile-mascot', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mascot: nextMascot }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, '프로필 마스코트 변경에 실패했습니다.'));
      }

      setMascot(nextMascot);
      closeSheet();
    } catch (err) {
      alert(err instanceof Error ? err.message : '프로필 마스코트 변경에 실패했습니다.');
    }
  };

  return (
    <div className="my-page">
      <Header />

      <div className="my-page__back-header">
        <BackHeader title="마이페이지" onBack={() => navigate(-1)} />
      </div>

      <section className="my-page__profile">
        <div className="my-page__avatar-wrap">
          {mascotImageOf(mascot) ? (
            <img src={mascotImageOf(mascot) ?? ''} alt="" className="my-page__avatar" />
          ) : (
            <span className="my-page__avatar" aria-hidden="true" />
          )}
          <button
            type="button"
            className="my-page__avatar-edit-btn"
            aria-label="프로필 마스코트 변경"
            onClick={() => setOpenField('mascot')}
          >
            <Camera size={14} color="#ffffff" />
          </button>
        </div>

        <div className="my-page__nickname">
          <Typography variant="head3">{profile.nickname}</Typography>
          <button
            type="button"
            className="my-page__nickname-edit-btn"
            aria-label="닉네임 수정"
            onClick={() => setOpenField('nickname')}
          >
            <Pencil size={8} color="#000000" />
          </button>
        </div>
      </section>

      <nav className="my-page__group">
        {FIELDS_GROUP_1.map((field) => (
          <button
            key={field.key}
            type="button"
            className="my-page__row"
            onClick={() => setOpenField(field.key)}
          >
            <Typography variant="head3">{field.label}</Typography>
            <Typography variant="p2" color="#878787" className="my-page__row-value">
              {getFieldValue(field.key)}
            </Typography>
          </button>
        ))}
      </nav>

      <nav className="my-page__group">
        {FIELDS_GROUP_2.map((field) => {
          const isEmailLocked = field.key === 'email' && profile.socialAccount;

          return (
            <button
              key={field.key}
              type="button"
              className="my-page__row"
              onClick={() => {
                if (!isEmailLocked) setOpenField(field.key);
              }}
              disabled={isEmailLocked}
            >
              <Typography variant="head3">{field.label}</Typography>
              <Typography variant="p2" color="#878787" className="my-page__row-value">
                {isEmailLocked ? '소셜 로그인 계정' : getFieldValue(field.key)}
              </Typography>
            </button>
          );
        })}
      </nav>

      <div className="my-page__bottom-bar">
        <button type="button" className="my-page__save-btn" onClick={handleSave}>
          <Typography variant="subtitle1" color="#fffbfb">
            저장하기
          </Typography>
        </button>
      </div>

      <BottomSheet open={openField === 'name'} onClose={closeSheet}>
        <NameSheet
          value={profile.name}
          onSave={(name) => {
            setProfile((prev) => ({ ...prev, name }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'nickname'} onClose={closeSheet}>
        <NicknameSheet
          value={profile.nickname}
          onSave={(nickname) => {
            setProfile((prev) => ({ ...prev, nickname }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'birthdate'} onClose={closeSheet}>
        <BirthdateSheet
          value={profile.birthdate}
          onSave={(birthdate) => {
            setProfile((prev) => ({ ...prev, birthdate }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'gender'} onClose={closeSheet}>
        <GenderSheet
          value={profile.gender}
          onSave={(gender) => {
            setProfile((prev) => ({ ...prev, gender }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'phone'} onClose={closeSheet}>
        <PhoneSheet
          value={profile.phone}
          onSave={(phone) => {
            setProfile((prev) => ({ ...prev, phone }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'region'} onClose={closeSheet}>
        <RegionSheet
          value={profile.interestedRegion}
          onSave={(interestedRegion) => {
            setProfile((prev) => ({ ...prev, interestedRegion }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'email'} onClose={closeSheet}>
        <EmailSheet
          value={profile.email}
          onSave={async (email) => {
            try {
              const response = await apiFetch('/api/mypage/email', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: joinEmail(email) }),
              });

              if (!response.ok) {
                throw new Error(await readErrorMessage(response, '이메일 변경에 실패했습니다.'));
              }

              setProfile((prev) => ({ ...prev, email }));
              closeSheet();
            } catch (err) {
              alert(err instanceof Error ? err.message : '이메일 변경에 실패했습니다.');
            }
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'mascot'} onClose={closeSheet}>
        <MascotSheet value={mascot} onSave={handleMascotSave} />
      </BottomSheet>

      <BottomSheet open={openField === 'password'} onClose={closeSheet}>
        <PasswordSheet
          onSave={async (currentPassword, newPassword) => {
            try {
              const response = await apiFetch('/api/mypage/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
              });

              if (!response.ok) {
                throw new Error(await readErrorMessage(response, '비밀번호 변경에 실패했습니다.'));
              }

              closeSheet();
            } catch (err) {
              alert(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
            }
          }}
        />
      </BottomSheet>
    </div>
  );
}

export default MyPage;
