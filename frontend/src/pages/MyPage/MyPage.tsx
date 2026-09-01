import { useNavigate } from 'react-router-dom';
import { Camera, Pencil } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Typography from '@/components/Typography/Typography';
import './MyPage.css';

const PROFILE_FIELDS_GROUP_1 = ['이름', '생년월일', '성별', '전화번호', '관심 구/군'];
const PROFILE_FIELDS_GROUP_2 = ['이메일', '비밀번호'];

function MyPage() {
  const navigate = useNavigate();

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
          <Typography variant="head3">인천구로 탐험가</Typography>
          <button type="button" className="my-page__nickname-edit-btn" aria-label="닉네임 수정">
            <Pencil size={8} color="#000000" />
          </button>
        </div>
      </section>

      <nav className="my-page__group">
        {PROFILE_FIELDS_GROUP_1.map((label) => (
          <button key={label} type="button" className="my-page__row">
            <Typography variant="head3">{label}</Typography>
          </button>
        ))}
      </nav>

      <nav className="my-page__group">
        {PROFILE_FIELDS_GROUP_2.map((label) => (
          <button key={label} type="button" className="my-page__row">
            <Typography variant="head3">{label}</Typography>
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
    </div>
  );
}

export default MyPage;
