import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import LineTab from '@/components/Tab/LineTab';
import Input from '@/components/Input/Input';
import OptionTab from '@/components/Tab/OptionTab';
import Dropdown from '@/components/Dropdown/Dropdown';
import PlaceCard from '@/components/PlaceGuide/PlaceCard';
import PlaceGuideNearbyPanel from '@/components/PlaceGuide/PlaceGuideNearbyPanel';
import { mockPlaces } from '@/mocks/place';
import { mockCourses } from '@/mocks/courseguide';

import './PlaceGuideMainPage.css';

const TAB_ITEMS = ['장소 목록', '내주변', '북마크'];
const DISTRICTS = ['중구', '서구', '계양구', '부평구', '동구', '미추홀구', '남동구', '연수구'];
const PLACE_FILTERS = ['관광지', '카페', '식당', '숙소', '쇼핑'];
const SORT_OPTIONS = [
  { label: '가까운순', value: 'near' },
  { label: '이름순', value: 'name' },
];

const MAX_SUGGESTIONS = 6;

function PlaceGuideMainPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const [activeDistricts, setActiveDistricts] = useState<Set<number>>(new Set());

  const handleDistrictToggle = (index: number) => {
    setActiveDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const [activePlaceFilters, setActivePlaceFilters] = useState<Set<number>>(new Set());

  const handlePlaceFilterToggle = (index: number) => {
    setActivePlaceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const [sortValue, setSortValue] = useState('near');

  const selectedDistrictLabel =
    activeDistricts.size === 0
      ? '전체'
      : DISTRICTS.filter((_, index) => activeDistricts.has(index)).join(', ');

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

  const selectedDistrictNames = DISTRICTS.filter((_, index) => activeDistricts.has(index));
  const selectedCategoryNames = PLACE_FILTERS.filter((_, index) => activePlaceFilters.has(index));

  const filteredPlaces = mockPlaces.filter((place) => {
    const matchesDistrict =
      selectedDistrictNames.length === 0 || selectedDistrictNames.includes(place.district);
    const matchesCategory =
      selectedCategoryNames.length === 0 || selectedCategoryNames.includes(place.category);
    return matchesDistrict && matchesCategory;
  });

  const bookmarkedPlaces = mockPlaces.filter((place) => bookmarkedIds.has(place.id));

  const [query, setQuery] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  // 연관 검색어: 장소 이름 + 코스 이름 중 query 포함하는 것들
  const suggestions =
    query.trim() === ''
      ? []
      : [
          ...mockPlaces.filter((place) => place.title.includes(query)).map((place) => place.title),
          ...mockCourses
            .filter((course) => course.name.includes(query))
            .map((course) => course.name),
        ]
          // 중복 제거
          .filter((label, index, arr) => arr.indexOf(label) === index)
          .slice(0, MAX_SUGGESTIONS);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsSuggestionOpen(true);
  };

  // 연관 검색어 클릭 -> input에 채우기만, 검색 실행 X
  const handleSuggestionClick = (label: string) => {
    setQuery(label);
    setIsSuggestionOpen(false);
  };

  // 실제 검색 실행 -> 돋보기 클릭 또는 Enter -> 검색 결과 페이지로 이동
  const handleSearchSubmit = () => {
    if (query.trim() === '') return;
    navigate(`/place-guide/search?q=${encodeURIComponent(query)}`);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className="place-guide-main-page">
      <Header />
      <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />
      <LineTab items={TAB_ITEMS} activeIndex={activeIndex} onChange={setActiveIndex} />

      <div className="place-guide-search-box">
        <div className="place-guide-search-box__inner">
          <Input
            variant="box"
            placeholder="텍스트를 입력하세요."
            className="place-guide-search-box__input"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsSuggestionOpen(true)}
          />
          <Search
            className="place-guide-search-box__icon"
            size={20}
            color="#000000"
            onClick={handleSearchSubmit}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          />

          {isSuggestionOpen && suggestions.length > 0 && (
            <ul className="place-guide-suggestion-list">
              {suggestions.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className="place-guide-suggestion-item"
                    onClick={() => handleSuggestionClick(label)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="place-guide-location">현재 위치 : 인천광역시 완정로 ~~</p>

      {activeIndex === 0 && (
        <>
          <h3 className="place-guide-section-title">각 구별 주요 장소 안내</h3>

          <div className="place-guide-district-grid">
            {DISTRICTS.map((district, index) => (
              <OptionTab
                key={district}
                label={district}
                size="small"
                active={activeDistricts.has(index)}
                onClick={() => handleDistrictToggle(index)}
              />
            ))}
          </div>

          <h3 className="place-guide-filter-title">장소 필터</h3>

          <div className="place-guide-filter-list">
            {PLACE_FILTERS.map((filter, index) => (
              <OptionTab
                key={filter}
                label={filter}
                size="small"
                active={activePlaceFilters.has(index)}
                onClick={() => handlePlaceFilterToggle(index)}
              />
            ))}
          </div>

          <div className="place-guide-sort-dropdown">
            <Dropdown options={SORT_OPTIONS} value={sortValue} onChange={setSortValue} />
          </div>

          <h4 className="place-guide-result-title">주요 장소 : {selectedDistrictLabel}</h4>

          <div className="place-guide-card-list">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                title={place.title}
                subtitle={place.subtitle}
                bookmarked={bookmarkedIds.has(place.id)}
                onBookmarkClick={() => handleBookmarkToggle(place.id)}
              />
            ))}
          </div>
        </>
      )}

      {activeIndex === 1 && (
        <div className="place-guide-map-area">
          <div className="place-guide-map-placeholder">내 주변 지도</div>
          <PlaceGuideNearbyPanel places={mockPlaces} />
        </div>
      )}

      {activeIndex === 2 && (
        <div className="place-guide-card-list">
          {bookmarkedPlaces.length === 0 ? (
            <p className="place-guide-empty">북마크한 장소가 없습니다.</p>
          ) : (
            bookmarkedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                title={place.title}
                subtitle={place.subtitle}
                bookmarked={bookmarkedIds.has(place.id)}
                onBookmarkClick={() => handleBookmarkToggle(place.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PlaceGuideMainPage;
