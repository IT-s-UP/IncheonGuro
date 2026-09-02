import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

import './PlaceGuideMainPage.css';

const TAB_ITEMS = ['장소 목록', '내주변', '북마크'];
const DISTRICTS = ['중구', '서구', '계양구', '부평구', '동구', '미추홀구', '남동구', '연수구'];
const PLACE_FILTERS = ['관광지', '카페', '식당', '숙소', '쇼핑'];

const SORT_OPTIONS = [
  { label: '가까운순', value: 'near' },
  { label: '이름순', value: 'name' },
];

function PlaceGuideMainPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDistricts, setActiveDistricts] = useState<Set<number>>(new Set());

  // 이미 선택된 항목이면 제거, 아니면 추가
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

  // 북마크 상태 (카드 id 기준 Set으로 관리)
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

  // 선택된 구/카테고리 이름 목록 (인덱스 -> 실제 텍스트로 변환)
  const selectedDistrictNames = DISTRICTS.filter((_, index) => activeDistricts.has(index));
  const selectedCategoryNames = PLACE_FILTERS.filter((_, index) => activePlaceFilters.has(index));

  // 필터링된 장소 목록
  const filteredPlaces = mockPlaces.filter((place) => {
    const matchesDistrict =
      selectedDistrictNames.length === 0 || selectedDistrictNames.includes(place.district);
    const matchesCategory =
      selectedCategoryNames.length === 0 || selectedCategoryNames.includes(place.category);
    return matchesDistrict && matchesCategory;
  });

  const bookmarkedPlaces = mockPlaces.filter((place) => bookmarkedIds.has(place.id));

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
          />
          <Search className="place-guide-search-box__icon" size={20} color="#000000" />
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

      {/* 북마크 탭 */}
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
