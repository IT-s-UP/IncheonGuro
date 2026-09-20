import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import Button from '@/components/Button/Button';
import BackHeader from '@/components/Header/BackHeader';
import Header from '@/components/Header/Header';
import LineTab from '@/components/Tab/LineTab';
import Typography from '@/components/Typography/Typography';

import type { Course, CourseCost, CourseDay, Transport } from '../types';

import MyCourseMap from './MyCourseMap';
import PlaceSearch from './PlaceSearch';
import RouteDuration from './RouteDuration';
import './CourseEditPage.css';

interface CourseEditPageProps {
  course: Course;
  onBack: () => void;
  onSave: (course: Course) => void;
  intro?: ReactNode;
  secondaryAction?: { label: string; onClick: () => void };
}

interface DragInformation {
  startY: number;
  startHeight: number;
}

interface CircleIconProps {
  type: 'plus' | 'check';
}

type CostKey = keyof CourseCost;

const MIN_SHEET_HEIGHT = 230;
const DEFAULT_SHEET_HEIGHT = 350;

const transportOptions: Transport[] = ['도보', '대중교통', '자전거', '자차'];

const COST_ITEMS: Array<{
  key: CostKey;
  label: string;
}> = [
  {
    key: 'transportation',
    label: '교통비',
  },
  {
    key: 'food',
    label: '식비',
  },
  {
    key: 'admission',
    label: '입장료',
  },
  {
    key: 'etc',
    label: '기타',
  },
];

function createEmptyCosts(): CourseCost {
  return {
    transportation: 0,
    food: 0,
    admission: 0,
    etc: 0,
  };
}

function createEmptyDay(day: number): CourseDay {
  return {
    id: Date.now() + day,
    day,
    transport: '대중교통',
    places: [],
    costs: createEmptyCosts(),
  };
}

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d={open ? 'M5 12.5L10 7.5L15 12.5' : 'M5 7.5L10 12.5L15 7.5'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`;
}

function CourseEditPage({ course, onBack, onSave, intro, secondaryAction }: CourseEditPageProps) {
  const isNewCourse = course.name === '새 코스';

  const initialDays = course.days.length > 0 ? course.days : [createEmptyDay(1)];

  const [courseName, setCourseName] = useState(isNewCourse ? '' : course.name);

  const [previousCourseName, setPreviousCourseName] = useState(
    isNewCourse ? '새 코스' : course.name,
  );

  const [isEditingCourseName, setIsEditingCourseName] = useState(isNewCourse);

  const [days, setDays] = useState<CourseDay[]>(initialDays);

  const [selectedDayId, setSelectedDayId] = useState(initialDays[0].id);

  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);

  const [actionMenuPlaceId, setActionMenuPlaceId] = useState<number | null>(null);

  const [isCostDetailOpen, setIsCostDetailOpen] = useState(false);

  const [sheetHeight, setSheetHeight] = useState(DEFAULT_SHEET_HEIGHT);

  const [isDragging, setIsDragging] = useState(false);

  const dragInformation = useRef<DragInformation | null>(null);

  const selectedDay = days.find((courseDay) => courseDay.id === selectedDayId) ?? days[0];

  const displayedCourseName = courseName.trim() || previousCourseName || '새 코스';

  const totalCost = useMemo(() => {
    return Object.values(selectedDay.costs).reduce((total, cost) => total + cost, 0);
  }, [selectedDay.costs]);

  const getMaximumSheetHeight = () => {
    return Math.max(MIN_SHEET_HEIGHT, window.innerHeight - 190);
  };

  const clampSheetHeight = (height: number) => {
    return Math.min(Math.max(height, MIN_SHEET_HEIGHT), getMaximumSheetHeight());
  };

  const updateSelectedDay = (updater: (currentDay: CourseDay) => CourseDay) => {
    setDays((currentDays) =>
      currentDays.map((courseDay) =>
        courseDay.id === selectedDay.id ? updater(courseDay) : courseDay,
      ),
    );
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
  };

  const selectDay = (dayId: number) => {
    setSelectedDayId(dayId);
    setActionMenuPlaceId(null);
    setEditingPlaceId(null);
    setIsCostDetailOpen(false);
  };

  const addDay = () => {
    const nextDayNumber = days.length + 1;
    const newDay = createEmptyDay(nextDayNumber);

    setDays((currentDays) => [...currentDays, newDay]);

    setSelectedDayId(newDay.id);
    setIsCostDetailOpen(false);
  };

  const deleteSelectedDay = () => {
    if (days.length === 1) {
      window.alert('DAY 1은 최소 한 개 필요합니다.');
      return;
    }

    const deletedDayIndex = days.findIndex((courseDay) => courseDay.id === selectedDay.id);
    const remainingDays = days
      .filter((courseDay) => courseDay.id !== selectedDay.id)
      .map((courseDay, index) => ({ ...courseDay, day: index + 1 }));
    const nextSelectedDay = remainingDays[Math.min(deletedDayIndex, remainingDays.length - 1)];

    setDays(remainingDays);
    setSelectedDayId(nextSelectedDay.id);
    setActionMenuPlaceId(null);
    setEditingPlaceId(null);
    setIsCostDetailOpen(false);
  };

  const changeTransport = (transport: Transport) => {
    updateSelectedDay((currentDay) => ({
      ...currentDay,
      transport,
    }));
  };

  const addPlace = () => {
    const newPlaceId = Date.now();

    updateSelectedDay((currentDay) => ({
      ...currentDay,
      places: [
        ...currentDay.places,
        {
          id: newPlaceId,
          name: '새로운 장소',
          address: '주소를 입력해주세요.',
        },
      ],
    }));

    setEditingPlaceId(newPlaceId);
    setActionMenuPlaceId(null);
  };

  const deletePlace = (placeId: number) => {
    updateSelectedDay((currentDay) => ({
      ...currentDay,
      places: currentDay.places.filter((place) => place.id !== placeId),
    }));

    setActionMenuPlaceId(null);
  };

  const movePlace = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= selectedDay.places.length) {
      return;
    }

    updateSelectedDay((currentDay) => {
      const reorderedPlaces = [...currentDay.places];

      const selectedPlace = reorderedPlaces[index];

      if (!selectedPlace) {
        return currentDay;
      }

      reorderedPlaces.splice(index, 1);
      reorderedPlaces.splice(nextIndex, 0, selectedPlace);

      return {
        ...currentDay,
        places: reorderedPlaces,
      };
    });

    setActionMenuPlaceId(null);
  };

  const changeCost = (costKey: CostKey, value: string) => {
    const numberValue = Number(value.replace(/[^0-9]/g, ''));

    updateSelectedDay((currentDay) => ({
      ...currentDay,
      costs: {
        ...currentDay.costs,
        [costKey]: Number.isNaN(numberValue) ? 0 : numberValue,
      },
    }));
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
      days,
    });
  };

  const activeTransportIndex = transportOptions.indexOf(selectedDay.transport);

  return (
    <main className="course-edit-page">
      <Header />

      <div className="course-edit-page__title-bar" onPointerUp={handleTitleBarClick}>
        <BackHeader title={displayedCourseName} onBack={onBack} />
      </div>

      {intro && <div className="course-edit-page__intro">{intro}</div>}

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

      <div className="course-edit-page__day-tabs">
        {days.map((courseDay) => {
          const isActive = courseDay.id === selectedDay.id;

          return (
            <button
              className={[
                'course-edit-page__day-tab',
                isActive ? 'course-edit-page__day-tab--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              type="button"
              key={courseDay.id}
              aria-pressed={isActive}
              onClick={() => selectDay(courseDay.id)}
            >
              DAY {courseDay.day}
            </button>
          );
        })}

        <button className="course-edit-page__day-add" type="button" onClick={addDay}>
          ＋ DAY 추가
        </button>

        <button
          className="course-edit-page__day-delete"
          type="button"
          onClick={deleteSelectedDay}
          disabled={days.length === 1}
        >
          DAY 삭제
        </button>
      </div>

      <div className="course-edit-page__tabs">
        <LineTab
          items={transportOptions}
          activeIndex={activeTransportIndex}
          onChange={(index) => {
            const selectedTransport = transportOptions[index];

            if (selectedTransport) {
              changeTransport(selectedTransport);
            }
          }}
        />
      </div>

      <section
        className="course-edit-page__map"
        aria-label={`DAY ${selectedDay.day} 코스 지도`}
        style={{ height: `max(120px, calc(100svh - 220px - ${sheetHeight}px))`, minHeight: 120 }}
      >
        <MyCourseMap places={selectedDay.places} day={selectedDay.day} />
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
            DAY {selectedDay.day} 경로 안내
          </Typography>
        </div>

        <div className="course-edit-page__sheet-body">
          {selectedDay.places.length === 0 ? (
            <div className="course-edit-page__empty">
              <Typography variant="p2" color="#828585">
                DAY {selectedDay.day}에 장소를 추가해주세요.
              </Typography>
            </div>
          ) : (
            <ol className="course-edit-page__place-list">
              {selectedDay.places.map((place, index) => {
                const isFirstPlace = index === 0;

                const isLastPlace = index === selectedDay.places.length - 1;

                const isActionMenuOpen = actionMenuPlaceId === place.id;

                const placeLabel = isFirstPlace
                  ? '출발지'
                  : isLastPlace
                    ? '도착지'
                    : `경유지 ${index}`;

                return (
                  <li className="course-edit-page__route-group" key={place.id}>
                    <div className="course-edit-page__place">
                      <div className="course-edit-page__timeline">
                        <span
                          className="course-edit-page__place-marker"
                          aria-label={`${index + 1}번째 장소`}
                        />

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
                              <PlaceSearch
                                key={place.id}
                                place={place}
                                onSelect={(selected) => {
                                  updateSelectedDay((currentDay) => ({
                                    ...currentDay,
                                    places: currentDay.places.map((current) =>
                                      current.id === place.id ? selected : current,
                                    ),
                                  }));
                                  setEditingPlaceId(null);
                                }}
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
                            {editingPlaceId !== place.id && (
                              <Typography
                                as="p"
                                variant="caption2"
                                color="#828585"
                                className="course-edit-page__address"
                              >
                                {place.address}
                              </Typography>
                            )}
                          </div>

                          <button
                            className="course-edit-page__more-button"
                            type="button"
                            aria-label={`${place.name} 메뉴 열기`}
                            aria-expanded={isActionMenuOpen}
                            onClick={() => setActionMenuPlaceId(isActionMenuOpen ? null : place.id)}
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

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlaceId(place.id);
                                setActionMenuPlaceId(null);
                              }}
                            >
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
                            {selectedDay.transport}
                          </Typography>

                          <Typography as="p" variant="caption2" color="#828585">
                            <RouteDuration
                              from={place}
                              to={selectedDay.places[index + 1]}
                              transport={selectedDay.transport}
                            />
                          </Typography>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}

          <section className="course-edit-page__cost">
            <button
              className="course-edit-page__cost-summary"
              type="button"
              aria-expanded={isCostDetailOpen}
              onClick={() => setIsCostDetailOpen((current) => !current)}
            >
              <span className="course-edit-page__cost-heading">
                <Typography as="strong" variant="subtitle3">
                  예상 비용
                </Typography>

                <Typography variant="caption2" color="#828585">
                  DAY {selectedDay.day} 기준
                </Typography>
              </span>

              <span className="course-edit-page__cost-total">
                <Typography variant="subtitle2" color="#3f8ba7">
                  {formatPrice(totalCost)}
                </Typography>

                <ChevronIcon open={isCostDetailOpen} />
              </span>
            </button>

            {isCostDetailOpen && (
              <div className="course-edit-page__cost-detail">
                {COST_ITEMS.map((costItem) => (
                  <label className="course-edit-page__cost-row" key={costItem.key}>
                    <span>{costItem.label}</span>

                    <span className="course-edit-page__cost-input-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={selectedDay.costs[costItem.key] || ''}
                        placeholder="0"
                        aria-label={`${costItem.label} 입력`}
                        onChange={(event) => changeCost(costItem.key, event.target.value)}
                      />

                      <span>원</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="course-edit-page__actions">
          {secondaryAction ? (
            <Button size="sub" variant="primary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ) : (
            <Button size="sub" variant="primary" onClick={addPlace}>
              <span className="course-edit-page__button-content">
                <CircleIcon type="plus" />
                <span>장소 추가하기</span>
              </span>
            </Button>
          )}

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
