import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Typography from '@/components/Typography/Typography';
import PlaceCard from '@/components/PlaceGuide/PlaceCard'; // 장소 카드는 place-guide의 PlaceCard 그대로 재사용

import { getBookmarkedPlaces, removeBookmark } from '@/api/placeGuide';
import type { PlaceSummary } from '@/api/placeGuide';

import './BookmarkPage.css';

function BookmarkPage() {
  const navigate = useNavigate();

  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getBookmarkedPlaces()
      .then((placeList) => {
        if (cancelled) return;
        setPlaces(placeList);
      })
      .catch((error) => {
        console.error('북마크 조회 실패:', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // PlaceCard의 북마크 아이콘을 눌러서 바로 해제 - 목록에서도 즉시 제거
  const handleUnbookmarkPlace = async (placeId: string) => {
    try {
      await removeBookmark(placeId);
      setPlaces((previous) => previous.filter((place) => place.placeId !== placeId));
    } catch (error) {
      console.error('북마크 해제 실패:', error);
    }
  };

  return (
    <div className="bookmark-page">
      <Header />
      <BackHeader title="북마크 목록" onBack={() => navigate(-1)} />

      {isLoading ? (
        <p className="bookmark-page__empty">불러오는 중...</p>
      ) : (
        <>
          <section className="bookmark-page__section">
            <Typography as="h2" variant="head2" className="bookmark-page__section-title">
              장소
            </Typography>

            {places.length === 0 ? (
              <p className="bookmark-page__empty">북마크한 장소가 없습니다.</p>
            ) : (
              <div className="bookmark-page__place-list">
                {places.map((place) => (
                  <PlaceCard
                    key={place.placeId}
                    title={place.title}
                    subtitle={place.subtitle}
                    imageUrl={place.imageUrl}
                    bookmarked
                    onClick={() => navigate(`/place-guide/${place.placeId}`)}
                    onBookmarkClick={() => handleUnbookmarkPlace(place.placeId)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default BookmarkPage;
