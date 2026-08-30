import Header from '@/components/Header/Header';
import Typography from '@/components/Typography/Typography';
import './MainPage.css';

interface SpotCard {
  name: string;
  tag: string;
  color: string;
}

interface HotCard {
  name: string;
  color: string;
}

interface LandmarkCard {
  name: string;
  color: string;
}

const SPOT_CARDS: SpotCard[] = [
  { name: '야생화단지', tag: '관광지', color: '#c9d6c0' },
  { name: '청라하늘대교', tag: '관광지', color: '#a9c2d6' },
  { name: '정서진 중앙 시장', tag: '쇼핑', color: '#d6c9a9' },
];

const HOT_CARDS: HotCard[] = [
  { name: '카페', color: '#e0c9c9' },
  { name: '맛집', color: '#e0d3c9' },
  { name: '공원', color: '#c9e0cf' },
  { name: '야시장', color: '#c9d0e0' },
];

const LANDMARK_CARDS: LandmarkCard[] = [
  { name: '개항로', color: '#d3b8a0' },
  { name: '차이나타운', color: '#c94f4f' },
  { name: '수봉공원', color: '#7a9e6f' },
];

function MainPage() {
  return (
    <div className="main-page">
      <Header />

      <section className="main-page__hero">
        <Typography as="h1" variant="head1" className="main-page__title">
          인천의 숨은 매력을
          <br />
          발견해보세요
        </Typography>
        <div className="main-page__hero-image" />
      </section>

      <section className="main-page__spots">
        <Typography
          as="h2"
          variant="head2"
          className="main-page__section-title main-page__section-title--spots"
        >
          인기 관광지
        </Typography>

        <div className="main-page__region-tabs">
          <button type="button" className="main-page__region-tab">
            <Typography variant="p3">서해구</Typography>
          </button>
          <button type="button" className="main-page__region-tab main-page__region-tab--active">
            <Typography variant="p3">동인천구</Typography>
          </button>
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

      <section className="main-page__hot">
        <Typography
          as="h2"
          variant="head2"
          className="main-page__section-title main-page__section-title--hot"
        >
          핫플레이스
        </Typography>

        <ul className="main-page__hot-list">
          {HOT_CARDS.map((card) => (
            <li key={card.name} className="main-page__hot-card-wrap">
              <div className="main-page__hot-card" style={{ backgroundColor: card.color }} />
              <Typography variant="head3" className="main-page__hot-name">
                {card.name}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <section className="main-page__landmarks">
        <Typography
          as="h2"
          variant="head2"
          className="main-page__section-title main-page__section-title--landmarks"
        >
          인천 대표 명소
        </Typography>

        <ul className="main-page__landmark-list">
          {LANDMARK_CARDS.map((card) => (
            <li
              key={card.name}
              className="main-page__landmark-card"
              style={{ backgroundColor: card.color }}
            >
              <Typography variant="head3" color="#ffffff" className="main-page__landmark-name">
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
