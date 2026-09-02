import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Search } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import Input from '@/components/Input/Input';
import PlaceCard from '@/components/PlaceGuide/PlaceCard';
import { mockPlaces } from '@/mocks/place';
import { mockCourses } from '@/mocks/courseguide';

import './PlaceGuideSearchPage.css';

function PlaceGuideSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const submittedQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(submittedQuery);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  const handleBookmarkToggle = (id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSearchSubmit = () => {
    if (query.trim() === '') return;
    setSearchParams({ q: query });
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const searchResultPlaces = mockPlaces.filter((place) => place.title.includes(submittedQuery));
  const searchResultCourses = mockCourses.filter((course) => course.name.includes(submittedQuery));

  return (
    <div className="place-guide-search-page">
      <Header />
      <BackHeader title="주요 장소 안내" onBack={() => navigate('/place-guide')} />

      <div className="place-guide-search-page__search-box">
        <div className="place-guide-search-page__search-inner">
          <Input
            variant="box"
            placeholder="텍스트를 입력하세요."
            className="place-guide-search-page__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
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

      <p className="place-guide-search-page__location">현재 위치 : 인천광역시 완정로 ~~</p>

      <h4 className="place-guide-search-page__title">검색 결과</h4>

      <p className="place-guide-search-page__section-label">장소</p>
      {searchResultPlaces.length === 0 ? (
        <p className="place-guide-search-page__empty">검색된 장소가 없습니다.</p>
      ) : (
        <div className="place-guide-search-page__card-list">
          {searchResultPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              title={place.title}
              subtitle={place.subtitle}
              bookmarked={bookmarkedIds.has(place.id)}
              onClick={() => navigate(`/place-guide/${place.id}`)}
              onBookmarkClick={() => handleBookmarkToggle(place.id)}
            />
          ))}
        </div>
      )}

      <p className="place-guide-search-page__section-label">코스</p>
      {searchResultCourses.length === 0 ? (
        <p className="place-guide-search-page__empty">검색된 코스가 없습니다.</p>
      ) : (
        <ul className="place-guide-search-page__course-list">
          {searchResultCourses.map((course) => (
            <li key={course.courseId} className="place-guide-search-page__course-item">
              <p className="place-guide-search-page__course-name">{course.name}</p>
              <p className="place-guide-search-page__course-desc">
                {course.places.map((place) => place.name).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlaceGuideSearchPage;
