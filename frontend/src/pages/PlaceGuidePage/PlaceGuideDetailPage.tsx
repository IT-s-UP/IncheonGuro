import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bookmark, ImageIcon } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import PlaceGuideDetailImage from '@/components/PlaceGuide/PlaceGuideDetailImage';
import {
  getPlaceDetail,
  getPlaceImages,
  getNearbyPlaces,
  addBookmark,
  removeBookmark,
} from '@/api/placeGuide';
import type { PlaceDetail, PlaceSummary } from '@/api/placeGuide';
import { loadKakaoMap } from '@/pages/MyCourses/CourseEdit/kakaoMap';

import './PlaceGuideDetailPage.css';

// 관광공사 API가 텍스트 안에 HTML 줄바꿈 태그(<br>)를 그대로 넣어서 주는 경우가 있어서,
// 이 태그를 기준으로 문자열을 잘라 각 줄을 <span>+<br/>로 안전하게 렌더링함
// (dangerouslySetInnerHTML을 안 쓰고도 줄바꿈을 보여줄 수 있는 방법)
function renderMultilineText(text: string) {
  return text
    .split(/<br\s*\/?>/i)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
}

function PlaceGuideDetailPage() {
  const navigate = useNavigate();
  const { placeId } = useParams();

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceSummary[]>([]);

  const [bookmarked, setBookmarked] = useState(false);
  const [isBookmarkPending, setIsBookmarkPending] = useState(false);

  const [isImageSheetOpen, setIsImageSheetOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 장소 상세 조회
  useEffect(() => {
    if (!placeId) return;

    let isCancelled = false;
    setIsLoading(true);
    setLoadError(false);

    getPlaceDetail(placeId)
      .then((data) => {
        if (isCancelled) return;
        setPlace(data);
        setBookmarked(data.bookmarked);
      })
      .catch((error) => {
        console.error('장소 상세 조회 실패:', error);
        if (!isCancelled) setLoadError(true);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [placeId]);

  // 이미지 목록 조회
  useEffect(() => {
    if (!placeId) return;

    getPlaceImages(placeId)
      .then((images) => setImageUrls(images.map((img) => img.imageUrl)))
      .catch((error) => console.error('이미지 조회 실패:', error));
  }, [placeId]);

  // 주변 장소 조회
  useEffect(() => {
    if (!placeId) return;

    getNearbyPlaces(placeId)
      .then(setNearbyPlaces)
      .catch((error) => console.error('주변 장소 조회 실패:', error));
  }, [placeId]);

  // 상세 지도 - place가 준비되면 좌표로 지도 하나 + 마커 하나 그리기
  useEffect(() => {
    if (!place || !mapContainerRef.current) return;

    loadKakaoMap()
      .then((maps) => {
        if (!mapContainerRef.current) return;

        const center = new maps.LatLng(place.latitude, place.longitude);
        const map = new maps.Map(mapContainerRef.current, { center, level: 4 });

        const markerEl = document.createElement('div');
        markerEl.style.cssText =
          'width:16px;height:16px;border-radius:50% 50% 50% 0;background:#78aac3;transform:rotate(-45deg);border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.3);';
        new maps.CustomOverlay({ position: center, content: markerEl, yAnchor: 1 });

        setTimeout(() => {
          map.relayout();
          map.setCenter(center);
        }, 0);
      })
      .catch((error) => console.error('상세 지도 로드 실패:', error));
  }, [place]);

  const handleBookmarkToggle = async () => {
    if (!placeId || isBookmarkPending) return;

    setIsBookmarkPending(true);
    try {
      if (bookmarked) {
        await removeBookmark(placeId);
        setBookmarked(false);
      } else {
        await addBookmark(placeId);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      window.alert('로그인이 필요한 기능입니다.');
    } finally {
      setIsBookmarkPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="place-guide-detail-page">
        <Header />
        <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />
        <p className="place-guide-detail-page__not-found">불러오는 중...</p>
      </div>
    );
  }

  if (loadError || !place) {
    return (
      <div className="place-guide-detail-page">
        <Header />
        <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />
        <p className="place-guide-detail-page__not-found">장소를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 표 내용 1순위 - 이용시간/쉬는날/주차/문의 중 값이 있는 것만
  const infoItems = [
    { label: '이용시간', value: place.usageTime },
    { label: '쉬는날', value: place.restDate },
    { label: '주차', value: place.parking },
    { label: '문의', value: place.infoCenter },
  ].filter((item) => item.value && item.value.trim() !== '');

  return (
    <div className="place-guide-detail-page">
      <Header />
      <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />

      {/* 장소 대표 이미지 - imageUrls의 첫 번째 이미지를 사용, 없으면 안내 문구 */}
      <div className="place-guide-detail-page__image">
        {imageUrls.length > 0 ? (
          <img
            src={imageUrls[0]}
            alt={place.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>등록된 이미지가 없습니다.</span>
        )}
        {imageUrls.length > 0 && (
          <button
            type="button"
            className="place-guide-detail-page__image-more"
            onClick={() => setIsImageSheetOpen(true)}
          >
            <ImageIcon size={14} />
            더보기
          </button>
        )}
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

      <p className="place-guide-detail-page__description">
        {renderMultilineText(place.description)}
      </p>

      <button
        type="button"
        className="place-guide-detail-page__add-course-btn"
        onClick={() =>
          navigate(`/place-guide/${placeId}/add-to-course`, { state: { placeTitle: place.title } })
        }
      >
        + 내 코스에 추가하기
      </button>

      {/* 표 내용 - 1순위(이용시간/쉬는날/주차/문의) -> 없으면 2순위(입장료/화장실 등 폴백) -> 그것도 없으면 안내 문구 */}
      <div className="place-guide-detail-page__info-box">
        {infoItems.length > 0 ? (
          infoItems.map((item) => (
            <p key={item.label} className="place-guide-detail-page__info-row">
              <strong>{item.label}</strong>
              <br />
              {renderMultilineText(item.value)}
            </p>
          ))
        ) : place.extraInfoTexts.length > 0 ? (
          place.extraInfoTexts.map((text) => (
            <p key={text} className="place-guide-detail-page__info-row">
              {renderMultilineText(text)}
            </p>
          ))
        ) : (
          <span>등록된 이용 정보가 없습니다.</span>
        )}
      </div>

      {/* 상세 지도 - 좌표 기반으로 실제 지도 렌더링 */}
      <div ref={mapContainerRef} className="place-guide-detail-page__map" />

      {place.tags.length > 0 && (
        <div className="place-guide-detail-page__tags">
          {place.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="place-guide-detail-page__tag"
              onClick={() => navigate(`/place-guide/search?q=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {nearbyPlaces.length > 0 && (
        <>
          <h3 className="place-guide-detail-page__nearby-title">해당 장소의 주변에는?</h3>

          <div className="place-guide-detail-page__nearby-list">
            {nearbyPlaces.map((nearby) => (
              <button
                key={nearby.placeId}
                type="button"
                className="place-guide-detail-page__nearby-item"
                onClick={() => navigate(`/place-guide/${nearby.placeId}`)}
              >
                <p className="place-guide-detail-page__nearby-item-title">{nearby.title}</p>
                <p className="place-guide-detail-page__nearby-item-subtitle">{nearby.subtitle}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {isImageSheetOpen && (
        <PlaceGuideDetailImage imageUrls={imageUrls} onClose={() => setIsImageSheetOpen(false)} />
      )}
    </div>
  );
}

export default PlaceGuideDetailPage;
