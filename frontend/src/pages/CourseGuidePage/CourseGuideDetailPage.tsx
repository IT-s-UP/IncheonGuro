import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import CourseGuideDetailHeader from '@/components/CourseGuideDetail/CourseGuideDetailHeader';
import CourseGuideDayTabs from '@/components/CourseGuideDetail/CourseGuideDayTabs';
import CourseGuideDetailTransportTabs from '@/components/CourseGuideDetail/CourseGuideDetailTransportTabs';
import CourseGuideRouteMap from '@/components/CourseGuideDetail/CourseGuideRouteMap';
import CourseGuidePlaceSheet from '@/components/CourseGuideDetail/CourseGuidePlaceSheet';

import { mockCourses } from '@/mocks/courseguide';
import type {
  Course,
  CourseCost,
  CourseDay,
  CoursePlace,
  Transport,
} from '@/pages/MyCourses/types';

import './CourseGuideDetailPage.css';

const MY_COURSES_STORAGE_KEY = 'incheonguro-my-courses';

interface DragInformation {
  startY: number;
  startHeight: number;
}

const MIN_SHEET_HEIGHT = 230;
const DEFAULT_SHEET_HEIGHT = 470;

const transportOptions: Transport[] = ['도보', '대중교통', '자전거', '자차'];

function createEmptyCosts(): CourseCost {
  return {
    transportation: 0,
    food: 0,
    admission: 0,
    etc: 0,
  };
}

function loadMyCourses(): Course[] {
  const raw = localStorage.getItem(MY_COURSES_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Course[]) : [];
  } catch {
    return [];
  }
}

function CourseGuideDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const numericCourseId = Number(courseId);

  const matchedCourse = mockCourses.find((course) => course.courseId === numericCourseId);

  const defaultCourseName = matchedCourse ? matchedCourse.name : `코스 안내 #${courseId ?? ''}`;

  const initialPlaces: CoursePlace[] = matchedCourse
    ? matchedCourse.places.map((place, index) => ({
        id: numericCourseId * 1000 + index + 1,
        name: place.name,
        address: place.address,
      }))
    : [];

  const initialDays: CourseDay[] = [
    {
      id: Date.now() + 1,
      day: 1,
      transport: '대중교통',
      places: initialPlaces,
      costs: createEmptyCosts(),
    },
  ];

  const [courseName, setCourseName] = useState(defaultCourseName);

  const [previousCourseName, setPreviousCourseName] = useState(defaultCourseName);

  const [isEditingCourseName, setIsEditingCourseName] = useState(false);

  const [days, setDays] = useState<CourseDay[]>(initialDays);

  const [selectedDayId, setSelectedDayId] = useState(initialDays[0].id);

  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);

  const [actionMenuPlaceId, setActionMenuPlaceId] = useState<number | null>(null);

  const [sheetHeight, setSheetHeight] = useState(DEFAULT_SHEET_HEIGHT);

  const [isDragging, setIsDragging] = useState(false);

  const dragInformation = useRef<DragInformation | null>(null);

  const selectedDay = days.find((courseDay) => courseDay.id === selectedDayId) ?? days[0];

  const displayedCourseName = courseName.trim() || previousCourseName || defaultCourseName;

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

    if (!courseName.trim() && displayedCourseName !== defaultCourseName) {
      setCourseName(displayedCourseName);
    }

    setIsEditingCourseName(true);
  };

  const finishEditingCourseName = () => {
    const trimmedName = courseName.trim();

    if (!trimmedName) {
      setCourseName(previousCourseName);
    } else {
      setCourseName(trimmedName);
      setPreviousCourseName(trimmedName);
    }

    setIsEditingCourseName(false);
  };

  const cancelEditingCourseName = () => {
    setCourseName(previousCourseName === defaultCourseName ? '' : previousCourseName);

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
  };

  const addDay = () => {
    const nextDayNumber = days.length + 1;
    const newDay: CourseDay = {
      id: Date.now() + nextDayNumber,
      day: nextDayNumber,
      transport: '대중교통',
      places: [],
      costs: createEmptyCosts(),
    };

    setDays((currentDays) => [...currentDays, newDay]);

    setSelectedDayId(newDay.id);
  };

  const changeTransport = (transport: Transport) => {
    updateSelectedDay((currentDay) => ({
      ...currentDay,
      transport,
    }));
  };

  const changePlaceName = (placeId: number, name: string) => {
    updateSelectedDay((currentDay) => ({
      ...currentDay,
      places: currentDay.places.map((place) => (place.id === placeId ? { ...place, name } : place)),
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

  const toggleActionMenu = (placeId: number) => {
    setActionMenuPlaceId((current) => (current === placeId ? null : placeId));
  };

  const startEditPlace = (placeId: number) => {
    setEditingPlaceId(placeId);
    setActionMenuPlaceId(null);
  };

  const finishEditingPlace = () => {
    setEditingPlaceId(null);
  };

  // 내 코스 목록에 새 코스로 저장한 뒤 /my-courses로 이동
  const saveCourse = () => {
    const trimmedName = courseName.trim();

    if (!trimmedName) {
      window.alert('코스 이름을 입력해주세요.');
      setIsEditingCourseName(true);
      return;
    }

    const newCourse: Course = {
      id: Date.now(),
      name: trimmedName,
      days,
    };

    const existingCourses = loadMyCourses();

    localStorage.setItem(MY_COURSES_STORAGE_KEY, JSON.stringify([...existingCourses, newCourse]));

    navigate('/my-courses');
  };

  return (
    <main className="course-guide-detail-page">
      <Header />

      <CourseGuideDetailHeader
        displayedCourseName={displayedCourseName}
        onBack={() => navigate('/course-guide')}
        onTitleBarPointerUp={handleTitleBarClick}
        isEditingCourseName={isEditingCourseName}
        courseName={courseName}
        onChangeCourseName={setCourseName}
        onFinishEditingCourseName={finishEditingCourseName}
        onCancelEditingCourseName={cancelEditingCourseName}
      />

      <CourseGuideDayTabs
        days={days}
        selectedDayId={selectedDay.id}
        onSelectDay={selectDay}
        onAddDay={addDay}
      />

      <CourseGuideDetailTransportTabs
        options={transportOptions}
        activeTransport={selectedDay.transport}
        onChange={changeTransport}
      />

      <CourseGuideRouteMap selectedDay={selectedDay} />

      <CourseGuidePlaceSheet
        selectedDay={selectedDay}
        sheetHeight={sheetHeight}
        isDragging={isDragging}
        minSheetHeight={MIN_SHEET_HEIGHT}
        maxSheetHeight={getMaximumSheetHeight()}
        onSheetPointerDown={handleSheetPointerDown}
        onSheetPointerMove={handleSheetPointerMove}
        onSheetPointerUp={finishSheetDragging}
        onSheetKeyDown={handleSheetKeyDown}
        editingPlaceId={editingPlaceId}
        actionMenuPlaceId={actionMenuPlaceId}
        onChangePlaceName={changePlaceName}
        onFinishEditingPlace={finishEditingPlace}
        onToggleActionMenu={toggleActionMenu}
        onStartEditPlace={startEditPlace}
        onMovePlace={movePlace}
        onDeletePlace={deletePlace}
        onAddPlace={addPlace}
        onSaveCourse={saveCourse}
      />
    </main>
  );
}

export default CourseGuideDetailPage;
