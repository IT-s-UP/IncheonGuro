import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import Button from '@/components/Button/Button';
import BackHeader from '@/components/Header/BackHeader';
import Header from '@/components/Header/Header';
import LineTab from '@/components/Tab/LineTab';
import Typography from '@/components/Typography/Typography';

import type { Course, CoursePlace, Transport } from '../types';
import './CourseEditPage.css';

interface CourseEditPageProps {
  course: Course;
  onBack: () => void;
  onSave: (course: Course) => void;
}

interface DragInformation {
  startY: number;
  startHeight: number;
}

interface CircleIconProps {
  type: 'plus' | 'check';
}

const MIN_SHEET_HEIGHT = 230;
const DEFAULT_SHEET_HEIGHT = 430;

const defaultPlaces: CoursePlace[] = [
  {
    id: 1,
    name: '청라호수공원',
    address: '인천광역시 서구 청라대로 204',
  },
  {
    id: 2,
    name: '정서진중앙시장',
    address: '인천광역시 서구 원창로239번길 11',
  },
  {
    id: 3,
    name: '아라뱃길 전망대',
    address: '인천광역시 서구 정서진1로 41',
  },
];

const transportOptions: Transport[] = ['도보', '대중교통', '자전거', '자차'];

function CircleIcon({ type }: CircleIconProps) {
  return (
    <svg
      className="course-edit-page__button-icon"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />

      {type === 'plus' ? (
        <>
          <path d="M9 5.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5.5 9H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      ) : (
        <path
          d="M5.5 9L8 11.5L12.5 6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M17.1429 0H2.85714C1.28571 0 0.014286 1.3 0.014286 2.88889L0 26L10 21.6667L20 26V2.88889C20 1.3 18.7143 0 17.1429 0ZM17.1429 21.6667L10 18.5178L2.85714 21.6667V2.88889H17.1429V21.6667Z"
        fill="currentColor"
      />

      {active && (
        <path
          d="M2.85714 2.88889H17.1429V21.6667L10 18.5178L2.85714 21.6667V2.88889Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

function CourseEditPage({ course, onBack, onSave }: CourseEditPageProps) {
  const isNewCourse = course.name === '새 코스';

  const [courseName, setCourseName] = useState(isNewCourse ? '' : course.name);

  const [previousCourseName, setPreviousCourseName] = useState(
    isNewCourse ? '새 코스' : course.name,
  );

  const [isEditingCourseName, setIsEditingCourseName] = useState(isNewCourse);

  const [transport, setTransport] = useState<Transport>(course.transport ?? '대중교통');

  const [places, setPlaces] = useState<CoursePlace[]>(course.places ?? defaultPlaces);

  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);

  const [actionMenuPlaceId, setActionMenuPlaceId] = useState<number | null>(null);

  const [isBookmarked, setIsBookmarked] = useState(false);

  const [sheetHeight, setSheetHeight] = useState(DEFAULT_SHEET_HEIGHT);

  const [isDragging, setIsDragging] = useState(false);

  const dragInformation = useRef<DragInformation | null>(null);

  const displayedCourseName = courseName.trim() || previousCourseName || '새 코스';

  const getMaximumSheetHeight = () => {
    const availableHeight = window.innerHeight - 190;

    return Math.max(MIN_SHEET_HEIGHT, availableHeight);
  };

  const clampSheetHeight = (height: number) => {
    return Math.min(Math.max(height, MIN_SHEET_HEIGHT), getMaximumSheetHeight());
  };

  const startEditingCourseName = () => {
    setPreviousCourseName(displayedCourseName);

    if (!courseName.trim() && displayedCourseName !== '새 코스') {
      setCourseName(displayedCourseName);
    }

    setIsEditingCourseName(true);
  };

  const finishEditingCourseName = () => {
    const trimmedName = courseName.trim();

    if (!trimmedName) {
      if (isNewCourse && previousCourseName === '새 코스') {
        window.alert('코스 이름을 입력해주세요.');
        return;
      }

      setCourseName(previousCourseName);
    } else {
      setCourseName(trimmedName);
      setPreviousCourseName(trimmedName);
    }

    setIsEditingCourseName(false);
  };

  const cancelEditingCourseName = () => {
    setCourseName(previousCourseName === '새 코스' ? '' : previousCourseName);

    setIsEditingCourseName(false);
  };

  const handleTitleBarClick = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest('.back-header__title')) {
      startEditingCourseName();
    }
  };

  const handleSheetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragInformation.current = {
      startY: event.clientY,
      startHeight: sheetHeight,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragInformation.current) {
      return;
    }

    const movedDistance = dragInformation.current.startY - event.clientY;

    setSheetHeight(clampSheetHeight(dragInformation.current.startHeight + movedDistance));
  };

  const finishSheetDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragInformation.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleSheetKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();

      setSheetHeight((currentHeight) => clampSheetHeight(currentHeight + 40));
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      setSheetHeight((currentHeight) => clampSheetHeight(currentHeight - 40));
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setSheetHeight(MIN_SHEET_HEIGHT);
    }

    if (event.key === 'End') {
      event.preventDefault();
      setSheetHeight(getMaximumSheetHeight());
    }
  };

  const toggleActionMenu = (placeId: number) => {
    setActionMenuPlaceId((currentPlaceId) => (currentPlaceId === placeId ? null : placeId));
  };

  const changePlaceName = (placeId: number, name: string) => {
    setPlaces((currentPlaces) =>
      currentPlaces.map((place) => (place.id === placeId ? { ...place, name } : place)),
    );
  };

  const startEditingPlace = (placeId: number) => {
    setEditingPlaceId(placeId);
    setActionMenuPlaceId(null);
  };

  const deletePlace = (placeId: number) => {
    setPlaces((currentPlaces) => currentPlaces.filter((place) => place.id !== placeId));

    setActionMenuPlaceId(null);
  };

  const movePlace = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= places.length) {
      return;
    }

    setPlaces((currentPlaces) => {
      const reorderedPlaces = [...currentPlaces];
      const selectedPlace = reorderedPlaces[index];

      if (!selectedPlace) {
        return currentPlaces;
      }

      reorderedPlaces.splice(index, 1);
      reorderedPlaces.splice(nextIndex, 0, selectedPlace);

      return reorderedPlaces;
    });

    setActionMenuPlaceId(null);
  };

  const addPlace = () => {
    const newPlaceId = Date.now();

    setPlaces((currentPlaces) => [
      ...currentPlaces,
      {
        id: newPlaceId,
        name: '새로운 장소',
        address: '주소를 입력해주세요.',
      },
    ]);

    setEditingPlaceId(newPlaceId);
    setActionMenuPlaceId(null);

    setSheetHeight((currentHeight) => clampSheetHeight(Math.max(currentHeight, 430)));
  };

  const saveCourse = () => {
    const trimmedName = courseName.trim();

    if (!trimmedName) {
      window.alert('코스 이름을 입력해주세요.');
      setIsEditingCourseName(true);
      return;
    }

    onSave({
      ...course,
      name: trimmedName,
      transport,
      places,
    });
  };

  const getPlaceLabel = (index: number, totalPlaces: number) => {
    if (index === 0) {
      return '출발지';
    }

    if (index === totalPlaces - 1) {
      return '도착지';
    }

    return `경유지 ${index}`;
  };

  const activeTransportIndex = transportOptions.indexOf(transport);

  return (
    <main className="course-edit-page">
      <Header />

      <div className="course-edit-page__title-bar" onPointerUp={handleTitleBarClick}>
        <BackHeader title={displayedCourseName} onBack={onBack} />

        <button
          className={[
            'course-edit-page__bookmark-button',
            isBookmarked ? 'course-edit-page__bookmark-button--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type="button"
          aria-label={isBookmarked ? '코스 저장 해제' : '코스 저장'}
          aria-pressed={isBookmarked}
          onClick={() => setIsBookmarked((current) => !current)}
        >
          <BookmarkIcon active={isBookmarked} />
        </button>
      </div>

      {isEditingCourseName && (
        <div className="course-edit-page__name-editor">
          <label htmlFor="course-name">코스 이름</label>

          <input
            id="course-name"
            value={courseName}
            maxLength={20}
            placeholder="코스 이름을 입력해주세요."
            onChange={(event) => setCourseName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                finishEditingCourseName();
              }

              if (event.key === 'Escape') {
                cancelEditingCourseName();
              }
            }}
            autoFocus
          />

          <button
            className="course-edit-page__name-complete"
            type="button"
            onClick={finishEditingCourseName}
          >
            완료
          </button>
        </div>
      )}

      <div className="course-edit-page__tabs">
        <LineTab
          items={transportOptions}
          activeIndex={activeTransportIndex}
          onChange={(index) => {
            const selectedTransport = transportOptions[index];

            if (selectedTransport) {
              setTransport(selectedTransport);
            }
          }}
        />
      </div>

      <section className="course-edit-page__map" aria-label="코스 지도">
        {places.length === 0 && (
          <div className="course-edit-page__map-placeholder">
            <Typography variant="subtitle3">지도</Typography>

            <Typography variant="caption2" color="#828585">
              지도 API 연동 영역
            </Typography>
          </div>
        )}

        <div className="course-edit-page__map-route">
          {places.slice(0, 4).map((place, index) => (
            <span
              className="course-edit-page__map-pin"
              key={place.id}
              style={{
                top: `${28 + index * 52}px`,
                left: `${145 + index * 25}px`,
              }}
              aria-hidden="true"
            >
              {index + 1}
            </span>
          ))}
        </div>
      </section>

      <section
        className={`course-edit-page__sheet${
          isDragging ? ' course-edit-page__sheet--dragging' : ''
        }`}
        style={{ height: sheetHeight }}
      >
        <div
          className="course-edit-page__sheet-drag-area"
          role="slider"
          tabIndex={0}
          aria-label="경로 안내창 높이 조절"
          aria-valuemin={MIN_SHEET_HEIGHT}
          aria-valuemax={getMaximumSheetHeight()}
          aria-valuenow={Math.round(sheetHeight)}
          onPointerDown={handleSheetPointerDown}
          onPointerMove={handleSheetPointerMove}
          onPointerUp={finishSheetDragging}
          onPointerCancel={finishSheetDragging}
          onKeyDown={handleSheetKeyDown}
        >
          <div className="course-edit-page__sheet-handle" />
        </div>

        <div className="course-edit-page__sheet-header">
          <Typography as="h2" variant="head3" className="course-edit-page__route-title">
            경로 안내
          </Typography>
        </div>

        <div className="course-edit-page__sheet-body">
          {places.length === 0 ? (
            <div className="course-edit-page__empty">
              <Typography variant="p2" color="#828585">
                코스에 장소를 추가해주세요.
              </Typography>
            </div>
          ) : (
            <ol className="course-edit-page__place-list">
              {places.map((place, index) => {
                const isFirstPlace = index === 0;
                const isLastPlace = index === places.length - 1;

                const isActionMenuOpen = actionMenuPlaceId === place.id;

                const placeLabel = getPlaceLabel(index, places.length);

                return (
                  <li className="course-edit-page__route-group" key={place.id}>
                    <div className="course-edit-page__place">
                      <div className="course-edit-page__timeline">
                        <span className="course-edit-page__place-marker">{index + 1}</span>

                        {!isLastPlace && (
                          <div className="course-edit-page__timeline-line" aria-hidden="true" />
                        )}
                      </div>

                      <div className="course-edit-page__place-content">
                        <div className="course-edit-page__place-main">
                          <div className="course-edit-page__place-info">
                            <Typography variant="caption2" color="#828585">
                              {placeLabel}
                            </Typography>

                            {editingPlaceId === place.id ? (
                              <input
                                className="course-edit-page__place-input"
                                value={place.name}
                                maxLength={30}
                                onChange={(event) => changePlaceName(place.id, event.target.value)}
                                onBlur={() => setEditingPlaceId(null)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    setEditingPlaceId(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <Typography
                                as="strong"
                                variant="subtitle3"
                                className="course-edit-page__place-name"
                              >
                                {place.name}
                              </Typography>
                            )}

                            <Typography
                              as="p"
                              variant="caption2"
                              color="#828585"
                              className="course-edit-page__address"
                            >
                              {place.address}
                            </Typography>
                          </div>

                          <button
                            className="course-edit-page__more-button"
                            type="button"
                            aria-label={`${place.name} 메뉴 열기`}
                            aria-expanded={isActionMenuOpen}
                            onClick={() => toggleActionMenu(place.id)}
                          >
                            ⋯
                          </button>
                        </div>

                        {isActionMenuOpen && (
                          <div className="course-edit-page__place-actions">
                            <button
                              type="button"
                              disabled={isFirstPlace}
                              onClick={() => movePlace(index, -1)}
                            >
                              위로
                            </button>

                            <button
                              type="button"
                              disabled={isLastPlace}
                              onClick={() => movePlace(index, 1)}
                            >
                              아래로
                            </button>

                            <button type="button" onClick={() => startEditingPlace(place.id)}>
                              수정
                            </button>

                            <button
                              className="course-edit-page__delete"
                              type="button"
                              onClick={() => deletePlace(place.id)}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isLastPlace && (
                      <div className="course-edit-page__transport-step">
                        <div className="course-edit-page__transport-timeline">
                          <span className="course-edit-page__transport-marker" aria-hidden="true" />
                        </div>

                        <div className="course-edit-page__transport-info">
                          <Typography as="strong" variant="caption1">
                            {transport}
                          </Typography>

                          <Typography as="p" variant="caption2" color="#828585">
                            약 10분 · 예상 이동 시간
                          </Typography>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="course-edit-page__actions">
          <Button size="sub" variant="primary" onClick={addPlace}>
            <span className="course-edit-page__button-content">
              <CircleIcon type="plus" />
              <span>새 코스 만들기</span>
            </span>
          </Button>

          <Button size="sub" variant="primary" onClick={saveCourse}>
            <span className="course-edit-page__button-content">
              <CircleIcon type="check" />
              <span>코스 저장하기</span>
            </span>
          </Button>
        </div>
      </section>
    </main>
  );
}

export default CourseEditPage;
