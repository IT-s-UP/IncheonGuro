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

/* =========================
   지역
========================= */

const DISTRICTS: {
  label: string;
  value: District;
}[] = [
  {
    label: '제물포구',
    value: 'JEMULPO',
  },
  {
    label: '영종구',
    value: 'YEONGJONG',
  },
  {
    label: '서해구',
    value: 'SEOHAE',
  },
  {
    label: '검단구',
    value: 'GEOMDAN',
  },
  {
    label: '계양구',
    value: 'GYEYANG',
  },
  {
    label: '부평구',
    value: 'BUPYEONG',
  },
  {
    label: '미추홀구',
    value: 'MICHUHOL',
  },
  {
    label: '남동구',
    value: 'NAMDONG',
  },
  {
    label: '연수구',
    value: 'YEONSU',
  },
  {
    label: '강화군',
    value: 'GANGHWA',
  },
  {
    label: '옹진군',
    value: 'ONGJIN',
  },
];

/* =========================
   장소 유형

   화면에서는 음식점 하나로 표시
   실제 백엔드에서는 RESTAURANT 사용

   CAFE는 음식점 필터에 포함시키지 않음
   ========================= */

const PLACE_FILTERS: {
  label: string;
  value: PlaceCategory;
}[] = [
  {
    label: '관광지',
    value: 'ATTRACTION',
  },
  {
    label: '문화시설',
    value: 'CULTURE',
  },
  {
    label: '레포츠',
    value: 'LEISURE',
  },
  {
    label: '음식점',
    value: 'RESTAURANT',
  },
  {
    label: '숙박',
    value: 'LODGING',
  },
  {
    label: '쇼핑',
    value: 'SHOPPING',
  },
];

/* =========================
   정렬
========================= */

const SORT_OPTIONS = [
  {
    label: '이름순',
    value: 'name',
  },
  {
    label: '가까운순',
    value: 'near',
  },
];

const MAX_SUGGESTIONS = 6;

/* =========================
   두 좌표 사이 거리 계산
   단위: km
========================= */

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function PlaceGuideMainPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  /* =========================
     초기 검색어
  ========================= */

  const initialQuery = searchParams.get('q') ?? '';

  /* =========================
     초기 지역
  ========================= */

  const initialDistrictValue = searchParams.get('districts');

  const initialActiveDistricts = new Set<number>();

  if (initialDistrictValue) {
    DISTRICTS.forEach((district, index) => {
      if (district.value === initialDistrictValue) {
        initialActiveDistricts.add(index);
      }
    });
  }

  /* =========================
     탭
  ========================= */

  const [activeIndex, setActiveIndex] = useState(0);

  /* =========================
     현재 위치
  ========================= */

  const [currentAddressText, setCurrentAddressText] = useState('현재 위치를 확인하는 중...');

  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  /*
   * 페이지 진입 시 현재 위치를 한 번만 가져옴
   *
   * 이 위치는
   * 1. 현재 위치 주소
   * 2. 장소 목록 "가까운순"
   * 3. 내 주변
   * 에서 공통으로 사용
   */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setUserPosition({
          lat: latitude,
          lng: longitude,
        });

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

  /* =========================
     검색
  ========================= */

  const [query, setQuery] = useState(initialQuery);

  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);

  /* =========================
     장소 목록
  ========================= */

  const [activeDistricts, setActiveDistricts] = useState<Set<number>>(initialActiveDistricts);

  const [activePlaceFilters, setActivePlaceFilters] = useState<Set<number>>(new Set());

  const [sortValue, setSortValue] = useState('name');

  const [places, setPlaces] = useState<PlaceSummary[]>([]);

  const [isPlacesLoading, setIsPlacesLoading] = useState(true);

  /* =========================
     지역 필터
  ========================= */

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

  const handleAllDistrictClick = () => {
    setActiveDistricts(new Set());
  };

  /* =========================
     장소 유형 필터
  ========================= */

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

  const handleAllPlaceFilterClick = () => {
    setActivePlaceFilters(new Set());
  };

  /* =========================
     선택된 지역 이름
  ========================= */

  const selectedDistrictLabel =
    activeDistricts.size === 0
      ? '전체'
      : DISTRICTS.filter((_, index) => activeDistricts.has(index))
          .map((district) => district.label)
          .join(', ');

  /* =========================
     장소 목록 조회
  ========================= */

  useEffect(() => {
    if (activeIndex !== 0) {
      return;
    }

    const selectedDistrictValues = DISTRICTS.filter((_, index) => activeDistricts.has(index)).map(
      (district) => district.value,
    );

    const selectedCategoryValues = PLACE_FILTERS.filter((_, index) =>
      activePlaceFilters.has(index),
    ).map((filter) => filter.value);

    setIsPlacesLoading(true);

    getPlaces(selectedDistrictValues, selectedCategoryValues)
      .then((data) => {
        let sorted = [...data];

        /* =========================
           이름순
        ========================= */

        if (sortValue === 'name') {
          sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
        }

        /* =========================
           가까운순
        ========================= */

        if (sortValue === 'near') {
          /*
           * 현재 위치를 가져온 경우에만
           * 실제 거리 계산
           */
          if (userPosition) {
            sorted.sort((a, b) => {
              /*
               * 좌표가 없는 장소는 가장 뒤로
               */
              if (a.latitude == null || a.longitude == null) {
                return 1;
              }

              if (b.latitude == null || b.longitude == null) {
                return -1;
              }

              const distanceA = calculateDistance(
                userPosition.lat,
                userPosition.lng,
                a.latitude,
                a.longitude,
              );

              const distanceB = calculateDistance(
                userPosition.lat,
                userPosition.lng,
                b.latitude,
                b.longitude,
              );

              return distanceA - distanceB;
            });
          }
        }

        setPlaces(sorted);
      })
      .catch((error) => {
        console.error('장소 목록 조회 실패:', error);

        setPlaces([]);
      })
      .finally(() => {
        setIsPlacesLoading(false);
      });
  }, [activeIndex, activeDistricts, activePlaceFilters, sortValue, userPosition]);

  /* =========================
     내 주변
  ========================= */

  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceSummary[]>([]);

  const [isNearbyLoading, setIsNearbyLoading] = useState(false);

  const [nearbyError, setNearbyError] = useState<string | null>(null);

  useEffect(() => {
    if (activeIndex !== 1) {
      return;
    }

    if (!userPosition) {
      setNearbyError('위치 정보를 가져올 수 없습니다. 위치 권한을 허용해주세요.');

      return;
    }

    setIsNearbyLoading(true);
    setNearbyError(null);

    getPlacesNearMe(userPosition.lat, userPosition.lng)
      .then(setNearbyPlaces)
      .catch((error) => {
        console.error('내 주변 장소 조회 실패:', error);

        setNearbyError('주변 장소를 불러오지 못했습니다.');
      })
      .finally(() => {
        setIsNearbyLoading(false);
      });
  }, [activeIndex, userPosition]);

  /* =========================
     내 주변 지도
  ========================= */

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapInstanceRef = useRef<MapInstance | null>(null);

  useEffect(() => {
    if (activeIndex !== 1 || !userPosition || !mapContainerRef.current) {
      return;
    }

    loadKakaoMap()
      .then((maps) => {
        if (!mapContainerRef.current) {
          return;
        }

        const center = new maps.LatLng(userPosition.lat, userPosition.lng);

        const map = new maps.Map(mapContainerRef.current, {
          center,
          level: 5,
        });

        mapInstanceRef.current = map;

        /* =========================
           현재 위치 표시
        ========================= */

        const myPositionEl = document.createElement('div');

        myPositionEl.style.cssText = `
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #4285f4;
          border: 2px solid #ffffff;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        `;

        const myPositionOverlay = new maps.CustomOverlay({
          position: center,
          content: myPositionEl,
          yAnchor: 0.5,
        });

        myPositionOverlay.setMap(map);

        /* =========================
           주변 장소 표시
        ========================= */

        nearbyPlaces.forEach((place) => {
          if (place.latitude == null || place.longitude == null) {
            return;
          }

          const markerEl = document.createElement('div');

          markerEl.textContent = place.title;

          markerEl.style.cssText = `
            padding: 5px 9px;
            background: #ffffff;
            border: 1px solid #78aac3;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
            cursor: pointer;
          `;

          const position = new maps.LatLng(place.latitude, place.longitude);

          const placeOverlay = new maps.CustomOverlay({
            position,
            content: markerEl,
            yAnchor: 1.2,
          });

          placeOverlay.setMap(map);
        });

        setTimeout(() => {
          map.relayout();
          map.setCenter(center);
        }, 100);
      })
      .catch((error) => {
        console.error('카카오맵 로드 실패:', error);
      });

    return () => {
      mapInstanceRef.current = null;
    };
  }, [activeIndex, userPosition, nearbyPlaces]);

  /* =========================
     북마크
  ========================= */

  const [bookmarkedPlaces, setBookmarkedPlaces] = useState<PlaceSummary[]>([]);

  const [isBookmarksLoading, setIsBookmarksLoading] = useState(false);

  useEffect(() => {
    if (activeIndex !== 2) {
      return;
    }

    setIsBookmarksLoading(true);

    getBookmarkedPlaces()
      .then(setBookmarkedPlaces)
      .catch((error) => {
        console.error('북마크 목록 조회 실패:', error);
      })
      .finally(() => {
        setIsBookmarksLoading(false);
      });
  }, [activeIndex]);

  const filteredBookmarkedPlaces = query.trim()
    ? bookmarkedPlaces.filter(
        (place) => place.title.includes(query) || place.subtitle.includes(query),
      )
    : bookmarkedPlaces;

  /* =========================
     북마크 토글
  ========================= */

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
          places.find((place) => place.placeId === placeId) ??
          nearbyPlaces.find((place) => place.placeId === placeId);

        if (found) {
          setBookmarkedPlaces((prev) => [...prev, found]);
        }
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);

      window.alert('로그인이 필요한 기능입니다.');
    }
  };

  /* =========================
     자동완성
  ========================= */

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
        .then((data) => {
          setSuggestions(data.slice(0, MAX_SUGGESTIONS));
        })
        .catch((error) => {
          console.error('자동완성 조회 실패:', error);
        });
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
    if (activeIndex === 2) {
      return;
    }

    if (query.trim() === '') {
      return;
    }

    navigate(`/place-guide/search?q=${encodeURIComponent(query)}`);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  /* =========================
     화면
  ========================= */

  return (
    <div className="place-guide-main-page">
      <Header />

      <BackHeader title="주요 장소 안내" onBack={() => navigate(-1)} />

      <LineTab items={TAB_ITEMS} activeIndex={activeIndex} onChange={setActiveIndex} />

      {/* =========================
          검색
      ========================= */}

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
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
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

      {/* =========================
          장소 목록
      ========================= */}

      {activeIndex === 0 && (
        <>
          <div className="place-guide-filter-scroll">
            <div className="place-guide-filter-row">
              <OptionTab
                label="전체"
                size="small"
                active={activeDistricts.size === 0}
                onClick={handleAllDistrictClick}
              />

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
          </div>

          <h3 className="place-guide-filter-title">장소 필터</h3>

          <div className="place-guide-filter-scroll">
            <div className="place-guide-filter-row">
              <OptionTab
                label="전체"
                size="small"
                active={activePlaceFilters.size === 0}
                onClick={handleAllPlaceFilterClick}
              />

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

      {/* =========================
          내 주변
      ========================= */}

      {activeIndex === 1 && (
        <div className="place-guide-nearby-tab">
          <div className="place-guide-map-area">
            {isNearbyLoading || nearbyError ? (
              <div className="place-guide-map-placeholder">
                {isNearbyLoading ? '위치를 확인하는 중...' : nearbyError}
              </div>
            ) : (
              <div ref={mapContainerRef} className="place-guide-kakao-map" />
            )}

            <PlaceGuideNearbyPanel places={nearbyPlaces} />
          </div>
        </div>
      )}

      {/* =========================
          북마크
      ========================= */}

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
