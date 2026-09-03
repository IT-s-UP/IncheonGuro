import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Bookmark, ImageIcon } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import PlaceGuideDetailImage from '@/components/PlaceGuide/PlaceGuideDetailImage';
import { mockPlaces } from '@/mocks/place';

import './PlaceGuideDetailPage.css';

function PlaceGuideDetailPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();

  const place = mockPlaces.find((item) => item.id === Number(placeId));

  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmarkToggle = () => {
    setBookmarked((prev) => !prev);
  };

  const [isImageSheetOpen, setIsImageSheetOpen] = useState(false);

  // 상세 지도 아래 "해당 장소의 주변에는?" - 같은 구의 다른 장소 몇 개 (자기 자신 제외)
  const nearbyPlaces = place
    ? mockPlaces
        .filter((item) => item.district === place.district && item.id !== place.id)
        .slice(0, 4)
    : [];

  if (!place) {
    return (
      <div className="place-guide-detail-page">
        <Header />
        <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />
        <p className="place-guide-detail-page__not-found">장소를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="place-guide-detail-page">
      <Header />
      <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />

      {/* 장소 이미지 - 실제 연동 전까지 회색 박스 */}
      <div className="place-guide-detail-page__image">
        <span>장소 이미지</span>
        <button
          type="button"
          className="place-guide-detail-page__image-more"
          onClick={() => setIsImageSheetOpen(true)}
        >
          <ImageIcon size={14} />
          더보기
        </button>
      </div>

      <div className="place-guide-detail-page__header-row">
        <h2 className="place-guide-detail-page__title">[{place.title}]</h2>
        <button
          type="button"
          className="place-guide-detail-page__bookmark-btn"
          onClick={handleBookmarkToggle}
          aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
          aria-pressed={bookmarked}
        >
          <Bookmark size={22} fill={bookmarked ? '#000000' : 'none'} color="#000000" />
        </button>
      </div>

      <p className="place-guide-detail-page__address">주소 : {place.subtitle}</p>

      <p className="place-guide-detail-page__description">{place.description}</p>

      <button type="button" className="place-guide-detail-page__add-course-btn">
        + 내 코스에 추가하기
      </button>

      {/* 표 내용 - 실제 연동 전까지 빈 박스 */}
      <div className="place-guide-detail-page__info-box">
        표 내용 (장소 관련 정보... 화장실, 입장료 등)
      </div>

      {/* 상세 지도 - 실제 연동 전까지 회색 박스 */}
      <div className="place-guide-detail-page__map">상세 지도</div>

      <div className="place-guide-detail-page__tags">
        {place.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="place-guide-detail-page__tag"
            onClick={() => navigate(`/place-guide?q=${encodeURIComponent(tag)}`)}
          >
            {tag}
          </button>
        ))}
      </div>

      <h3 className="place-guide-detail-page__nearby-title">해당 장소의 주변에는?</h3>

      <div className="place-guide-detail-page__nearby-list">
        {nearbyPlaces.map((nearby) => (
          <button
            key={nearby.id}
            type="button"
            className="place-guide-detail-page__nearby-item"
            onClick={() => navigate(`/place-guide/${nearby.id}`)}
          >
            <p className="place-guide-detail-page__nearby-item-title">{nearby.title}</p>
            <p className="place-guide-detail-page__nearby-item-subtitle">{nearby.subtitle}</p>
          </button>
        ))}
      </div>

      {isImageSheetOpen && (
        <PlaceGuideDetailImage imageCount={4} onClose={() => setIsImageSheetOpen(false)} />
      )}
    </div>
  );
}

export default PlaceGuideDetailPage;
