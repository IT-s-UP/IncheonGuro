import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import {
  getPlaces,
  getPlacesNearMe,
  getBookmarkedPlaces,
  getAutocomplete,
  addBookmark,
  removeBookmark,
} from '@/api/placeGuide';
import type { District, PlaceCategory, PlaceSummary } from '@/api/placeGuide';
import { loadKakaoMap } from '@/pages/MyCourses/CourseEdit/kakaoMap';
import type { MapInstance } from '@/pages/MyCourses/CourseEdit/kakaoMap';

import './PlaceGuideMainPage.css';

const TAB_ITEMS = ['장소 목록', '내주변', '북마크'];

// 화면에 보여줄 한글 라벨과, 백엔드 enum 값을 짝지어둠
const DISTRICTS: { label: string; value: District }[] = [
  { label: '제물포구', value: 'JEMULPO' },
  { label: '영종구', value: 'YEONGJONG' },
  { label: '서해구', value: 'SEOHAE' },
  { label: '검단구', value: 'GEOMDAN' },
  { label: '계양구', value: 'GYEYANG' },
  { label: '부평구', value: 'BUPYEONG' },
  { label: '미추홀구', value: 'MICHUHOL' },
  { label: '남동구', value: 'NAMDONG' },
  { label: '연수구', value: 'YEONSU' },
  { label: '강화군', value: 'GANGHWA' },
  { label: '옹진군', value: 'ONGJIN' },
];

const PLACE_FILTERS: { label: string; value: PlaceCategory }[] = [
  { label: '관광지', value: 'ATTRACTION' },
  { label: '카페', value: 'CAFE' },
  { label: '식당', value: 'RESTAURANT' },
  { label: '숙소', value: 'LODGING' },
  { label: '쇼핑', value: 'SHOPPING' },
];

const SORT_OPTIONS = [
  { label: '이름순', value: 'name' },
  { label: '가까운순', value: 'near' },
];

const MAX_SUGGESTIONS = 6;

function PlaceGuideMainPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const initialDistrictValue = searchParams.get('districts');
  const initialActiveDistricts = new Set(
    DISTRICTS.reduce<number[]>((indices, district, index) => {
      if (district.value === initialDistrictValue) {
        indices.push(index);
      }
      return indices;
    }, []),
  );

  const [activeIndex, setActiveIndex] = useState(0);

  // ===== 현재 위치 텍스트 (역지오코딩) =====
  const [currentAddressText, setCurrentAddressText] = useState('현재 위치를 확인하는 중...');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        loadKakaoMap()
          .then((maps) => {
            const geocoder = new maps.services.Geocoder();

            (geocoder as any).coord2Address(
              longitude,
              latitude,
              (result: any[], status: string) => {
                if (status === maps.services.Status.OK && result[0]) {
                  const addr =
                    result[0].road_address?.address_name ?? result[0].address?.address_name;
                  setCurrentAddressText(
                    addr ? `현재 위치 : ${addr}` : '현재 위치를 확인할 수 없습니다.',
                  );
                } else {
                  setCurrentAddressText('현재 위치를 확인할 수 없습니다.');
                }
              },
            );
          })
          .catch((error) => {
            console.error('주소 변환 실패:', error);
            setCurrentAddressText('현재 위치를 확인할 수 없습니다.');
          });
      },
      (error) => {
        console.error('위치 정보 조회 실패:', error);
        setCurrentAddressText('위치 권한을 허용해주세요.');
      },
    );
  }, []);

  // ===== 검색창 (다른 탭들이 query를 참조하므로 먼저 선언) =====
  const [query, setQuery] = useState(initialQuery);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // ===== 장소 목록 탭 =====
  // const [activeDistricts, setActiveDistricts] = useState<Set<number>>(new Set());
  const [activeDistricts, setActiveDistricts] = useState<Set<number>>(initialActiveDistricts);
  const [activePlaceFilters, setActivePlaceFilters] = useState<Set<number>>(new Set());
  const [sortValue, setSortValue] = useState('name');
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [isPlacesLoading, setIsPlacesLoading] = useState(true);

  const handleDistrictToggle = (index: number) => {
    setActiveDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handlePlaceFilterToggle = (index: number) => {
    setActivePlaceFilters((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectedDistrictLabel =
    activeDistricts.size === 0
      ? '전체'
      : DISTRICTS.filter((_, index) => activeDistricts.has(index))
          .map((d) => d.label)
          .join(', ');

  useEffect(() => {
    if (activeIndex !== 0) return;

    const selectedDistrictValues = DISTRICTS.filter((_, index) => activeDistricts.has(index)).map(
      (d) => d.value,
    );
    const selectedCategoryValues = PLACE_FILTERS.filter((_, index) =>
      activePlaceFilters.has(index),
    ).map((f) => f.value);

    setIsPlacesLoading(true);
    getPlaces(selectedDistrictValues, selectedCategoryValues)
      .then((data) => {
        const sorted =
          sortValue === 'name' ? [...data].sort((a, b) => a.title.localeCompare(b.title)) : data;
        setPlaces(sorted);
      })
      .catch((error) => console.error('장소 목록 조회 실패:', error))
      .finally(() => setIsPlacesLoading(false));
  }, [activeIndex, activeDistricts, activePlaceFilters, sortValue]);

  // ===== 내 주변 탭 =====
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceSummary[]>([]);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  useEffect(() => {
    if (activeIndex !== 1) return;

    setIsNearbyLoading(true);
    setNearbyError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });

        getPlacesNearMe(latitude, longitude)
          .then(setNearbyPlaces)
          .catch((error) => {
            console.error('내 주변 장소 조회 실패:', error);
            setNearbyError('주변 장소를 불러오지 못했습니다.');
          })
          .finally(() => setIsNearbyLoading(false));
      },
      (error) => {
        console.error('위치 정보 조회 실패:', error);
        setNearbyError('위치 정보를 가져올 수 없습니다. 위치 권한을 허용해주세요.');
        setIsNearbyLoading(false);
      },
    );
  }, [activeIndex]);

  // ===== 내 주변 탭 - 지도 =====
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!userPosition || !mapContainerRef.current) return;

    loadKakaoMap()
      .then((maps) => {
        if (!mapContainerRef.current) return;

        const center = new maps.LatLng(userPosition.lat, userPosition.lng);
        const map = new maps.Map(mapContainerRef.current, { center, level: 5 });
        mapInstanceRef.current = map;

        const myPositionEl = document.createElement('div');
        myPositionEl.style.cssText =
          'width:14px;height:14px;border-radius:50%;background:#4285f4;border:2px solid #ffffff;box-shadow:0 0 4px rgba(0,0,0,0.3);';
        new maps.CustomOverlay({ position: center, content: myPositionEl, yAnchor: 0.5 });

        nearbyPlaces.forEach((place) => {
          const markerEl = document.createElement('div');
          markerEl.textContent = place.title;
          markerEl.style.cssText =
            'padding:4px 8px;background:#ffffff;border:1px solid #78aac3;border-radius:12px;font-size:11px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);';

          const position = new maps.LatLng(place.latitude, place.longitude);
          new maps.CustomOverlay({ position, content: markerEl, yAnchor: 1.2 });
        });

        // 컨테이너 크기가 늦게 확정되는 경우를 대비해, 지도 생성 직후 강제로 다시 계산시킴
        setTimeout(() => {
          map.relayout();
          map.setCenter(center);
        }, 0);
      })
      .catch((error) => console.error('카카오맵 로드 실패:', error));
  }, [userPosition, nearbyPlaces]);

  // ===== 북마크 탭 =====
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<PlaceSummary[]>([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(false);

  useEffect(() => {
    if (activeIndex !== 2) return;

    setIsBookmarksLoading(true);
    getBookmarkedPlaces()
      .then(setBookmarkedPlaces)
      .catch((error) => console.error('북마크 목록 조회 실패:', error))
      .finally(() => setIsBookmarksLoading(false));
  }, [activeIndex]);

  // 북마크 탭에서는 API 호출 없이, 이미 불러온 목록 안에서만 클라이언트 필터링
  const filteredBookmarkedPlaces = query.trim()
    ? bookmarkedPlaces.filter(
        (place) => place.title.includes(query) || place.subtitle.includes(query),
      )
    : bookmarkedPlaces;

  // ===== 북마크 토글 (공통) =====
  const isBookmarked = (placeId: string) =>
    bookmarkedPlaces.some((place) => place.placeId === placeId);

  const handleBookmarkToggle = async (placeId: string) => {
    const wasBookmarked = isBookmarked(placeId);

    try {
      if (wasBookmarked) {
        await removeBookmark(placeId);
        setBookmarkedPlaces((prev) => prev.filter((place) => place.placeId !== placeId));
      } else {
        await addBookmark(placeId);
        const found =
          places.find((p) => p.placeId === placeId) ??
          nearbyPlaces.find((p) => p.placeId === placeId);
        if (found) {
          setBookmarkedPlaces((prev) => [...prev, found]);
        }
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      window.alert('로그인이 필요한 기능입니다.');
    }
  };

  // ===== 검색 관련 동작 =====
  // 자동완성은 "장소 목록" / "내 주변" 탭에서만 API 호출 (북마크 탭은 클라이언트 필터링이라 불필요)
  useEffect(() => {
    if (activeIndex === 2) {
      setSuggestions([]);
      return;
    }

    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      getAutocomplete(query)
        .then((data) => setSuggestions(data.slice(0, MAX_SUGGESTIONS)))
        .catch((error) => console.error('자동완성 조회 실패:', error));
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, activeIndex]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsSuggestionOpen(true);
  };

  const handleSuggestionClick = (label: string) => {
    setQuery(label);
    setIsSuggestionOpen(false);
  };

  const handleSearchSubmit = () => {
    // 북마크 탭은 이미 실시간으로 필터링되고 있어서, 별도 페이지 이동이 필요 없음
    if (activeIndex === 2) return;
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

          {activeIndex !== 2 && isSuggestionOpen && suggestions.length > 0 && (
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
      <p className="place-guide-location">{currentAddressText}</p>
      {activeIndex === 0 && (
        <>
          <h3 className="place-guide-section-title">각 구별 주요 장소 안내</h3>

          <div className="place-guide-district-grid">
            {DISTRICTS.map((district, index) => (
              <OptionTab
                key={district.value}
                label={district.label}
                size="small"
                active={activeDistricts.has(index)}
                onClick={() => handleDistrictToggle(index)}
              />
            ))}
          </div>

          <h3 className="place-guide-filter-title">장소 필터</h3>

          <div className="place-guide-filter-row">
            {PLACE_FILTERS.map((filter, index) => (
              <OptionTab
                key={filter.value}
                label={filter.label}
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

          {isPlacesLoading ? (
            <p className="place-guide-empty">불러오는 중...</p>
          ) : places.length === 0 ? (
            <p className="place-guide-empty">해당 조건의 장소가 없습니다.</p>
          ) : (
            <div className="place-guide-card-list">
              {places.map((place) => (
                <PlaceCard
                  key={place.placeId}
                  title={place.title}
                  subtitle={place.subtitle}
                  imageUrl={place.imageUrl}
                  bookmarked={isBookmarked(place.placeId)}
                  onClick={() => navigate(`/place-guide/${place.placeId}`)}
                  onBookmarkClick={() => handleBookmarkToggle(place.placeId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeIndex === 1 && (
        <div className="place-guide-nearby-tab">
          <div className="place-guide-map-area">
            {isNearbyLoading || nearbyError ? (
              <div className="place-guide-map-placeholder">
                {isNearbyLoading ? '위치를 확인하는 중...' : nearbyError}
              </div>
            ) : (
              <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            )}
            <PlaceGuideNearbyPanel places={nearbyPlaces} />
          </div>
        </div>
      )}

      {activeIndex === 2 && (
        <div className="place-guide-card-list">
          {isBookmarksLoading ? (
            <p className="place-guide-empty">불러오는 중...</p>
          ) : filteredBookmarkedPlaces.length === 0 ? (
            <p className="place-guide-empty">
              {query.trim() ? '검색 결과가 없습니다.' : '북마크한 장소가 없습니다.'}
            </p>
          ) : (
            filteredBookmarkedPlaces.map((place) => (
              <PlaceCard
                key={place.placeId}
                title={place.title}
                subtitle={place.subtitle}
                imageUrl={place.imageUrl}
                bookmarked
                onClick={() => navigate(`/place-guide/${place.placeId}`)}
                onBookmarkClick={() => handleBookmarkToggle(place.placeId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PlaceGuideMainPage;
