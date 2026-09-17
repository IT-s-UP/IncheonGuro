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
import type { CourseSummary } from '@/api/courseGuide';

import './PlaceGuideSearchPage.css';

function PlaceGuideSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 검색 결과 카드의 북마크 버튼이 작동하도록, 내 북마크 목록을 별도로 조회해서 대조함
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getBookmarkedPlaces()
      .then((data) => setBookmarkedIds(new Set(data.map((p) => p.placeId))))
      .catch((error) => console.error('북마크 목록 조회 실패:', error));
  }, []);

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
        setBookmarkedIds((prev) => new Set(prev).add(placeId));
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      window.alert('로그인이 필요한 기능입니다.');
    }
  };

  const runSearch = (keyword: string) => {
    if (keyword.trim() === '') return;

    setIsLoading(true);
    setHasSearched(true);

    getSearchResult(keyword)
      .then((result) => {
        setPlaces(result.places);
        setCourses(result.courses);
      })
      .catch((error) => console.error('검색 결과 조회 실패:', error))
      .finally(() => setIsLoading(false));
  };

  // 페이지 진입 시(쿼리스트링에 검색어가 있으면) 자동으로 검색 실행
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = () => {
    runSearch(query);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className="place-guide-search-page">
      <Header />
      <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />

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
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="place-guide-search-page__empty">검색 중...</p>
      ) : !hasSearched ? (
        <p className="place-guide-search-page__empty">검색어를 입력해주세요.</p>
      ) : places.length === 0 && courses.length === 0 ? (
        <p className="place-guide-search-page__empty">검색 결과가 없습니다.</p>
      ) : (
        <>
          {places.length > 0 && (
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

          {courses.length > 0 && (
            <>
              <h3 className="place-guide-search-page__section-label">코스</h3>
              <ul className="place-guide-search-page__course-list">
                {courses.map((course) => (
                  <li key={course.courseId}>
                    <button
                      type="button"
                      className="place-guide-search-page__course-item"
                      onClick={() => navigate(`/course-guide/${course.courseId}`)}
                    >
                      <p className="place-guide-search-page__course-name">{course.name}</p>
                      <p className="place-guide-search-page__course-desc">{course.description}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PlaceGuideSearchPage;
