import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Button from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';

import { getFestivalById } from './mockData';

import './FestivalDetailPage.css';

/* =========================
   + 아이콘
========================= */

function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="festival-detail-add-icon">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />

      <path
        d="M10 6.5V13.5M6.5 10H13.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FestivalDetailPage() {
  const navigate = useNavigate();

  const { festivalId } = useParams();

  const festival = getFestivalById(Number(festivalId));

  /* =========================
     존재하지 않는 행사
  ========================= */

  if (!festival) {
    return (
      <div className="festival-detail-page">
        <Header />

        <main className="festival-detail-content">
          <BackHeader title="축제 / 행사 정보" onBack={() => navigate(-1)} />

          <div className="festival-detail-empty">
            <Typography variant="p2">축제 / 행사 정보를 찾을 수 없습니다.</Typography>
          </div>
        </main>
      </div>
    );
  }

  /* =========================
     내 코스에 추가
  ========================= */

  const handleAddToCourse = () => {
    navigate('/my-courses', {
      state: {
        festivalToAdd: {
          id: festival.id,

          name: festival.name,

          address: festival.address,
        },
      },
    });
  };

  return (
    <div className="festival-detail-page">
      <Header />

      <main className="festival-detail-content">
        {/* =========================
            BackHeader
        ========================= */}

        <BackHeader title="축제 / 행사 정보" onBack={() => navigate(-1)} />

        {/* =========================
            중앙 콘텐츠
        ========================= */}

        <section className="festival-detail-main">
          {/* 포스터 */}

          <div className="festival-detail-poster">
            {festival.posterUrl ? (
              <img src={festival.posterUrl} alt={`${festival.name} 포스터`} />
            ) : (
              <Typography variant="p0">축제 포스터</Typography>
            )}
          </div>

          {/* 이름 */}

          <Typography as="h1" variant="head2" className="festival-detail-title">
            {festival.name}
          </Typography>

          {/* =========================
              상세정보
          ========================= */}

          <div className="festival-detail-info">
            <div className="festival-detail-info__line">
              <Typography as="span" variant="head3">
                장소:
              </Typography>

              <Typography as="span" variant="p2">
                {' '}
                {festival.address}
              </Typography>
            </div>

            <div className="festival-detail-info__line">
              <Typography as="span" variant="head3">
                담당 연락처:
              </Typography>

              <Typography as="span" variant="p2">
                {' '}
                {festival.contact}
              </Typography>
            </div>

            <div className="festival-detail-info__description">
              <Typography as="span" variant="head3">
                축제 소개:
              </Typography>

              <Typography as="span" variant="p2">
                {' '}
                {festival.description}
              </Typography>
            </div>
          </div>
        </section>

        {/* =========================
            내 코스에 추가
        ========================= */}

        <div className="festival-detail-bottom">
          <Button size="main" variant="primary" onClick={handleAddToCourse}>
            <span className="festival-detail-add-button">
              <PlusCircleIcon />

              <span>내 코스에 추가하기</span>
            </span>
          </Button>
        </div>
      </main>
    </div>
  );
}

export default FestivalDetailPage;
