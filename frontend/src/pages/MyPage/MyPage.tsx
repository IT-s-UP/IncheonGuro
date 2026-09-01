import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pencil } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Typography from '@/components/Typography/Typography';
import BottomSheet from '@/components/BottomSheet/BottomSheet';
import NameSheet from './sheets/NameSheet';
import BirthdateSheet from './sheets/BirthdateSheet';
import type { Birthdate } from './sheets/BirthdateSheet';
import GenderSheet from './sheets/GenderSheet';
import type { Gender } from './sheets/GenderSheet';
import PhoneSheet from './sheets/PhoneSheet';
import RegionSheet from './sheets/RegionSheet';
import EmailSheet from './sheets/EmailSheet';
import type { EmailValue } from './sheets/EmailSheet';
import PasswordSheet from './sheets/PasswordSheet';
import './MyPage.css';

type FieldKey = 'name' | 'birthdate' | 'gender' | 'phone' | 'region' | 'email' | 'password';

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
  birthdate: Birthdate;
  gender: Gender;
  phone: string;
  region: string;
  email: EmailValue;
}

const INITIAL_PROFILE: ProfileState = {
  name: '인천구로 탐험가',
  birthdate: { year: 2000, month: 1, day: 1 },
  gender: '선택 안 함',
  phone: '',
  region: '없음',
  email: { id: '', domain: 'gmail.com' },
};

function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [openField, setOpenField] = useState<FieldKey | null>(null);

  const closeSheet = () => setOpenField(null);

  const handleSave = () => {
    navigate(-1);
  };

  return (
    <div className="my-page">
      <Header />

      <div className="my-page__back-header">
        <BackHeader title="마이페이지" onBack={() => navigate(-1)} />
      </div>

      <section className="my-page__profile">
        <div className="my-page__avatar-wrap">
          <span className="my-page__avatar" aria-hidden="true" />
          <button type="button" className="my-page__avatar-edit-btn" aria-label="프로필 사진 변경">
            <Camera size={14} color="#ffffff" />
          </button>
        </div>

        <div className="my-page__nickname">
          <Typography variant="head3">{profile.name}</Typography>
          <button
            type="button"
            className="my-page__nickname-edit-btn"
            aria-label="닉네임 수정"
            onClick={() => setOpenField('name')}
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
          </button>
        ))}
      </nav>

      <nav className="my-page__group">
        {FIELDS_GROUP_2.map((field) => (
          <button
            key={field.key}
            type="button"
            className="my-page__row"
            onClick={() => setOpenField(field.key)}
          >
            <Typography variant="head3">{field.label}</Typography>
          </button>
        ))}
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
          value={profile.region}
          onSave={(region) => {
            setProfile((prev) => ({ ...prev, region }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'email'} onClose={closeSheet}>
        <EmailSheet
          value={profile.email}
          onSave={(email) => {
            setProfile((prev) => ({ ...prev, email }));
            closeSheet();
          }}
        />
      </BottomSheet>

      <BottomSheet open={openField === 'password'} onClose={closeSheet}>
        <PasswordSheet onSave={closeSheet} />
      </BottomSheet>
    </div>
  );
}

export default MyPage;
