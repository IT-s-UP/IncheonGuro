import { ArrowRight } from 'lucide-react';

import Header from '@/components/Header/Header';
import Typography from '@/components/Typography/Typography';
import mainHero from '@/assets/main-hero.png';
import './MainPage.css';

interface SpotCard {
  name: string;
  tag: string;
  color: string;
}

interface RegionCard {
  name: string;
  color: string;
}

interface CourseCard {
  name: string;
  color: string;
}

const REGIONS = [
  '서해구',
  '제물포구',
  '영종구',
  '미추홀구',
  '연수구',
  '남동구',
  '부평구',
  '계양구',
  '검단구',
  '강화군',
  '옹진군',
];

const SPOT_CARDS: SpotCard[] = [
  { name: '야생화 단지', tag: '관광지', color: '#c9d6c0' },
  { name: '청라 하늘 대교', tag: '관광지', color: '#a9c2d6' },
  { name: '정서진 중앙시장', tag: '쇼핑', color: '#d6c9a9' },
];

const REGION_CARDS: RegionCard[] = REGIONS.map((name, index) => ({
  name,
  color: ['#e0c9c9', '#e0d3c9', '#c9e0cf', '#c9d0e0', '#dcc9e0'][index % 5],
}));

const COURSE_CARDS: CourseCard[] = [
  { name: '개항로 투어 코스', color: '#d3b8a0' },
  { name: '차이나타운 구경 코스', color: '#c94f4f' },
  { name: '오션뷰 산책 / 액티비티 코스', color: '#7a9e6f' },
];

function MainPage() {
  return (
    <div className="main-page">
      <Header />

      <section className="main-page__hero">
        <div className="main-page__title">
          <Typography as="h1" variant="head1">
            요즘 떠오르는
          </Typography>
          <Typography as="p" variant="head1">
            인천 장소를
          </Typography>
          <div className="main-page__title-cta">
            <Typography as="p" variant="head1">
              알아볼까요?
            </Typography>
            <button type="button" className="main-page__hero-arrow" aria-label="추천 장소 더보기">
              <ArrowRight size={16} color="#ffffff" />
            </button>
          </div>
        </div>
        <img src={mainHero} alt="" className="main-page__hero-image" />
      </section>

      <section className="main-page__spots">
        <Typography
          as="h2"
          variant="head2"
          className="main-page__section-title main-page__section-title--spots"
        >
          OO 님의 취향을 반영한 추천 장소
        </Typography>

        <div className="main-page__region-tabs">
          {REGIONS.slice(0, 2).map((region, index) => (
            <button
              key={region}
              type="button"
              className={[
                'main-page__region-tab',
                index === 0 ? 'main-page__region-tab--active' : '',
              ].join(' ')}
            >
              <Typography variant="p3">{region}</Typography>
            </button>
          ))}
        </div>

        <ul className="main-page__spot-list">
          {SPOT_CARDS.map((card) => (
            <li
              key={card.name}
              className="main-page__spot-card"
              style={{ backgroundColor: card.color }}
            >
              <Typography variant="p3" className="main-page__spot-tag">
                {card.tag}
              </Typography>
              <Typography variant="head3" color="#ffffff" className="main-page__spot-name">
                {card.name}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <section className="main-page__regions">
        <Typography
          as="h2"
          variant="head2"
          className="main-page__section-title main-page__section-title--regions"
        >
          인천의 모든 장소들
        </Typography>

        <ul className="main-page__region-list">
          {REGION_CARDS.map((card) => (
            <li key={card.name} className="main-page__region-card-wrap">
              <div className="main-page__region-card" style={{ backgroundColor: card.color }} />
              <Typography variant="head3" className="main-page__region-card-name">
                {card.name}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <section className="main-page__courses">
        <Typography
          as="h2"
          variant="head2"
          className="main-page__section-title main-page__section-title--courses"
        >
          OO 님의 취향을 반영한 추천 코스
        </Typography>

        <ul className="main-page__course-list">
          {COURSE_CARDS.map((card) => (
            <li
              key={card.name}
              className="main-page__course-card"
              style={{ backgroundColor: card.color }}
            >
              <Typography variant="head3" color="#ffffff" className="main-page__course-name">
                {card.name}
              </Typography>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default MainPage;
