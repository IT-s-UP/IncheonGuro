import { useEffect, useState } from 'react';
import type { CoursePlace } from '../types';
import { loadKakaoMap, type SearchPlace } from './kakaoMap';
import './PlaceSearch.css';

export default function PlaceSearch({
  place,
  onSelect,
}: {
  place: CoursePlace;
  onSelect: (place: CoursePlace) => void;
}) {
  const [query, setQuery] = useState(place.name === '새로운 장소' ? '' : place.name);
  const [results, setResults] = useState<SearchPlace[]>([]);
  const [message, setMessage] = useState('장소 이름을 입력하고 검색 결과를 선택해주세요.');
  useEffect(() => {
    let cancelled = false;
    let timeout: number | undefined;
    setResults([]);
    if (!query.trim()) {
      setMessage('장소 이름을 입력하고 검색 결과를 선택해주세요.');
      return;
    }
    setMessage('검색 중입니다.');
    const debounce = window.setTimeout(() => {
      timeout = window.setTimeout(() => {
        if (!cancelled) {
          cancelled = true;
          setMessage('검색이 지연되고 있습니다. 이름을 다시 입력해주세요.');
        }
      }, 15000);
      void loadKakaoMap()
        .then((maps) => {
          if (cancelled) return;
          new maps.services.Places().keywordSearch(
            query.trim(),
            (items, status) => {
              if (cancelled) return;
              window.clearTimeout(timeout);
              if (status === maps.services.Status.OK) {
                setResults(
                  items.filter(
                    (item) =>
                      Boolean(item.road_address_name || item.address_name) &&
                      Number.isFinite(Number(item.x)) &&
                      Number.isFinite(Number(item.y)),
                  ),
                );
                setMessage('주소를 확인하고 장소를 선택해주세요.');
              } else {
                setMessage(
                  status === maps.services.Status.ZERO_RESULT
                    ? '검색 결과가 없습니다. 지역명과 함께 검색해보세요.'
                    : '검색하지 못했습니다. 잠시 후 다시 입력해주세요.',
                );
              }
            },
            { location: new maps.LatLng(37.4563, 126.7052), size: 10 },
          );
        })
        .catch(() => {
          window.clearTimeout(timeout);
          if (!cancelled) setMessage('장소 검색을 불러오지 못했습니다. 잠시 후 다시 입력해주세요.');
        });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(debounce);
      window.clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="place-search">
      <input
        className="course-edit-page__place-input"
        aria-label="장소 이름 검색"
        placeholder="예: 인천 차이나타운"
        value={query}
        maxLength={100}
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
      />
      <p role="status" className="place-search__message">
        {message}
      </p>
      {results.length > 0 && (
        <ul className="place-search__results" aria-label="장소 검색 결과">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() =>
                  onSelect({
                    ...place,
                    name: result.place_name,
                    address: result.road_address_name || result.address_name,
                    latitude: Number(result.y),
                    longitude: Number(result.x),
                  })
                }
              >
                <strong>{result.place_name}</strong>
                <span>{result.road_address_name || result.address_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
