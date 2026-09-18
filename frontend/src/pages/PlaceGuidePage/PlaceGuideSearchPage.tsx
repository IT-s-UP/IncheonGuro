import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Input from '@/components/Input/Input';
import PlaceCard from '@/components/PlaceGuide/PlaceCard';

import {
  getSearchResult,
  getBookmarkedPlaces,
  addBookmark,
  removeBookmark,
} from '@/api/placeGuide';

import type { PlaceSummary } from '@/api/placeGuide';

import './PlaceGuideSearchPage.css';

function PlaceGuideSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);

  const [places, setPlaces] = useState<PlaceSummary[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);

  /*
   * 검색 결과 카드의 북마크 상태
   */
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // =========================================================
  // 북마크 목록 조회
  // =========================================================

  useEffect(() => {
    getBookmarkedPlaces()
      .then((data) => {
        setBookmarkedIds(new Set(data.map((place) => place.placeId)));
      })
      .catch((error) => {
        console.error('북마크 목록 조회 실패:', error);
      });
  }, []);

  // =========================================================
  // 북마크 추가 / 삭제
  // =========================================================

  const handleBookmarkToggle = async (placeId: string) => {
    const wasBookmarked = bookmarkedIds.has(placeId);

    try {
      if (wasBookmarked) {
        await removeBookmark(placeId);

        setBookmarkedIds((prev) => {
          const next = new Set(prev);

          next.delete(placeId);

          return next;
        });
      } else {
        await addBookmark(placeId);

        setBookmarkedIds((prev) => {
          const next = new Set(prev);

          next.add(placeId);

          return next;
        });
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);

      window.alert('로그인이 필요한 기능입니다.');
    }
  };

  // =========================================================
  // 장소 검색
  // =========================================================

  const runSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword === '') {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    getSearchResult(trimmedKeyword)
      .then((result) => {
        setPlaces(result.places);
      })
      .catch((error) => {
        console.error('검색 결과 조회 실패:', error);

        setPlaces([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // =========================================================
  // 페이지 진입 시 검색어가 있으면 자동 검색
  // =========================================================

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  // =========================================================
  // 검색 실행
  // =========================================================

  const handleSearchSubmit = () => {
    runSearch(query);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // =========================================================
  // 화면
  // =========================================================

  return (
    <div className="place-guide-search-page">
      <Header />

      <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />

      {/* 검색창 */}
      <div className="place-guide-search-page__search-box">
        <div className="place-guide-search-page__search-inner">
          <Input
            variant="box"
            placeholder="텍스트를 입력하세요."
            className="place-guide-search-page__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <Search
            className="place-guide-search-page__icon"
            size={20}
            color="#000000"
            onClick={handleSearchSubmit}
            style={{
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* 검색 결과 */}
      {isLoading ? (
        <p className="place-guide-search-page__empty">검색 중...</p>
      ) : !hasSearched ? (
        <p className="place-guide-search-page__empty">검색어를 입력해주세요.</p>
      ) : places.length === 0 ? (
        <p className="place-guide-search-page__empty">검색 결과가 없습니다.</p>
      ) : (
        <>
          <h3 className="place-guide-search-page__section-label">장소</h3>

          <div className="place-guide-search-page__card-list">
            {places.map((place) => (
              <PlaceCard
                key={place.placeId}
                title={place.title}
                subtitle={place.subtitle}
                imageUrl={place.imageUrl}
                bookmarked={bookmarkedIds.has(place.placeId)}
                onClick={() => navigate(`/place-guide/${place.placeId}`)}
                onBookmarkClick={() => handleBookmarkToggle(place.placeId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PlaceGuideSearchPage;
