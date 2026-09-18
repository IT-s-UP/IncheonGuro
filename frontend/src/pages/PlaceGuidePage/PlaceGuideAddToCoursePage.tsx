import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import { getPlaceDetail } from '@/api/placeGuide';
import { listCourses, updateCourse } from '@/api/courses';
import type { Course, CoursePlace } from '@/pages/MyCourses/types';

import './PlaceGuideAddToCoursePage.css';

// 상세 페이지에서 넘어오는 최소 정보. state로 못 받으면 API로 재조회해서 채움
interface PlaceSummaryInfo {
  title: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

function PlaceGuideAddToCoursePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId } = useParams();

  // 상세 페이지에서 이미 정보를 들고 넘어왔으면 API 재호출 없이 바로 사용
  // (기존엔 placeTitle만 받았는데, 코스에 저장할 때 주소/좌표도 같이 필요해져서 함께 받도록 확장)
  const placeInfoFromState = location.state as {
    placeTitle?: string;
    placeAddress?: string;
    placeLatitude?: number;
    placeLongitude?: number;
  } | null;

  const [placeInfo, setPlaceInfo] = useState<PlaceSummaryInfo | null>(
    placeInfoFromState?.placeTitle
      ? {
          title: placeInfoFromState.placeTitle,
          address: placeInfoFromState.placeAddress ?? '',
          latitude: placeInfoFromState.placeLatitude,
          longitude: placeInfoFromState.placeLongitude,
        }
      : null,
  );
  const [isLoading, setIsLoading] = useState(!placeInfoFromState?.placeTitle);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setIsCoursesLoading(false));
  }, []);

  // state로 넘어온 정보가 없을 때만(예: 새로고침으로 state가 사라진 경우) API 호출
  useEffect(() => {
    if (placeInfoFromState?.placeTitle || !placeId) return;

    getPlaceDetail(placeId)
      .then((data) =>
        setPlaceInfo({
          title: data.title,
          address: data.subtitle,
          latitude: data.latitude,
          longitude: data.longitude,
        }),
      )
      .catch((error) => {
        console.error('장소 정보 조회 실패:', error);
        setPlaceInfo(null);
      })
      .finally(() => setIsLoading(false));
  }, [placeId, placeInfoFromState?.placeTitle]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;
  const selectedDay = selectedCourse?.days.find((day) => day.id === selectedDayId) ?? null;

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    setSelectedDayId(course.days[0]?.id ?? null);
    setInsertIndex(course.days[0]?.places.length ?? null);
  };

  const handleSelectDay = (dayId: number) => {
    const day = selectedCourse?.days.find((courseDay) => courseDay.id === dayId);

    setSelectedDayId(dayId);
    setInsertIndex(day?.places.length ?? 0);
  };

  const handleAddPlace = async () => {
    if (!placeInfo || !selectedCourse || !selectedDay || insertIndex === null) return;

    const newPlace: CoursePlace = {
      id: Date.now(),
      name: placeInfo.title,
      address: placeInfo.address,
      latitude: placeInfo.latitude,
      longitude: placeInfo.longitude,
    };

    const updatedCourse: Course = {
      ...selectedCourse,
      days: selectedCourse.days.map((day) =>
        day.id === selectedDay.id
          ? {
              ...day,
              places: [
                ...day.places.slice(0, insertIndex),
                newPlace,
                ...day.places.slice(insertIndex),
              ],
            }
          : day,
      ),
    };

    try {
      await updateCourse(selectedCourse.id, updatedCourse);
    } catch (err) {
      alert(err instanceof Error ? err.message : '코스 저장에 실패했습니다.');
      return;
    }

    navigate(`/place-guide/${placeId}`);
  };

  return (
    <div className="place-guide-add-to-course-page">
      <Header />
      <BackHeader title="내 코스에 추가하기" onBack={() => navigate(`/place-guide/${placeId}`)} />

      {isLoading || isCoursesLoading ? (
        <p className="place-guide-add-to-course-page__empty">불러오는 중...</p>
      ) : !placeInfo ? (
        <p className="place-guide-add-to-course-page__empty">장소를 찾을 수 없습니다.</p>
      ) : courses.length === 0 ? (
        <p className="place-guide-add-to-course-page__empty">저장된 코스가 없습니다.</p>
      ) : (
        <>
          <ul className="place-guide-add-to-course-page__list">
          {courses.map((course) => (
            <li key={course.id}>
              <button
                type="button"
                className={[
                  'place-guide-add-to-course-page__course-btn',
                  course.id === selectedCourseId
                    ? 'place-guide-add-to-course-page__course-btn--selected'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleSelectCourse(course)}
                aria-pressed={course.id === selectedCourseId}
              >
                <span className="place-guide-add-to-course-page__course-name">{course.name}</span>
                <span className="place-guide-add-to-course-page__day-count">
                  {course.days.length}일 일정
                </span>
              </button>
            </li>
          ))}
          </ul>

          {selectedCourse && selectedDay && (
            <section className="place-guide-add-to-course-page__selection" aria-label="추가 위치 선택">
            <div className="place-guide-add-to-course-page__selection-group">
              <strong>추가할 DAY</strong>
              <div className="place-guide-add-to-course-page__choices">
                {selectedCourse.days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    className={day.id === selectedDay.id ? 'is-selected' : ''}
                    onClick={() => handleSelectDay(day.id)}
                    aria-pressed={day.id === selectedDay.id}
                  >
                    DAY {day.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="place-guide-add-to-course-page__selection-group">
              <strong>추가 위치</strong>
              <div className="place-guide-add-to-course-page__choices place-guide-add-to-course-page__choices--positions">
                {Array.from({ length: selectedDay.places.length + 1 }, (_, index) => {
                  const label =
                    index === 0
                      ? '맨 앞'
                      : index === selectedDay.places.length
                        ? '맨 뒤'
                        : `${selectedDay.places[index - 1].name} 뒤`;

                  return (
                    <button
                      key={index}
                      type="button"
                      className={index === insertIndex ? 'is-selected' : ''}
                      onClick={() => setInsertIndex(index)}
                      aria-pressed={index === insertIndex}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="place-guide-add-to-course-page__confirm-btn"
              onClick={() => void handleAddPlace()}
            >
              이 위치에 추가하기
            </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default PlaceGuideAddToCoursePage;
