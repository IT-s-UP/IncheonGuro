import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import { getPlaceDetail } from '@/api/placeGuide';
import { listCourses, updateCourse } from '@/api/courses';
import type { Course, CoursePlace } from '@/pages/MyCourses/types';

import './PlaceGuideAddToCoursePage.css';

// 상세 페이지에서 넘어오는 최소 정보
interface PlaceSummaryInfo {
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

function PlaceGuideAddToCoursePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId } = useParams();

  // 상세 페이지에서 넘어오는 정보
  const placeInfoFromState = location.state as {
    placeTitle?: string;
    placeAddress?: string;
    placeLatitude?: number | null;
    placeLongitude?: number | null;
  } | null;

  const [placeInfo, setPlaceInfo] = useState<PlaceSummaryInfo | null>(
    placeInfoFromState?.placeTitle
      ? {
          title: placeInfoFromState.placeTitle,
          address: placeInfoFromState.placeAddress ?? '',
          latitude: placeInfoFromState.placeLatitude ?? null,
          longitude: placeInfoFromState.placeLongitude ?? null,
        }
      : null,
  );

  const [isLoading, setIsLoading] = useState(
    !placeInfoFromState?.placeTitle,
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  // 선택한 코스
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
    null,
  );

  // 선택한 DAY
  const [selectedDayId, setSelectedDayId] = useState<number | null>(
    null,
  );

  // 장소를 삽입할 위치
  const [insertIndex, setInsertIndex] = useState<number | null>(
    null,
  );

  /* =========================
     내 코스 목록 조회
  ========================= */

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch((error) => {
        console.error('내 코스 목록 조회 실패:', error);
        setCourses([]);
      })
      .finally(() => {
        setIsCoursesLoading(false);
      });
  }, []);

  /* =========================
     장소 정보 조회

     state가 없는 경우에만 API 조회
  ========================= */

  useEffect(() => {
    if (placeInfoFromState?.placeTitle || !placeId) {
      return;
    }

    getPlaceDetail(placeId)
      .then((data) => {
        setPlaceInfo({
          title: data.title,
          address: data.subtitle,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      })
      .catch((error) => {
        console.error('장소 정보 조회 실패:', error);
        setPlaceInfo(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [placeId, placeInfoFromState?.placeTitle]);

  /* =========================
     현재 선택된 코스
  ========================= */

  const selectedCourse =
    courses.find((course) => course.id === selectedCourseId) ?? null;

  /* =========================
     현재 선택된 DAY
  ========================= */

  const selectedDay =
    selectedCourse?.days.find((day) => day.id === selectedDayId) ?? null;

  /* =========================
     코스 선택
  ========================= */

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);

    const firstDay = course.days[0];

    setSelectedDayId(firstDay?.id ?? null);
    setInsertIndex(firstDay?.places.length ?? null);
  };

  /* =========================
     DAY 선택
  ========================= */

  const handleSelectDay = (dayId: number) => {
    if (!selectedCourse) {
      return;
    }

    const day = selectedCourse.days.find(
      (courseDay) => courseDay.id === dayId,
    );

    setSelectedDayId(dayId);
    setInsertIndex(day?.places.length ?? 0);
  };

  /* =========================
     장소 추가
  ========================= */

  const handleAddPlace = async () => {
    if (
      !placeInfo ||
      !selectedCourse ||
      !selectedDay ||
      insertIndex === null
    ) {
      return;
    }

    /*
     * 좌표가 없는 장소는 CoursePlace에 넣을 수 없음.
     *
     * CoursePlace의 latitude / longitude가
     * number 타입이기 때문에 여기서 검사한다.
     */
    if (
      placeInfo.latitude === null ||
      placeInfo.longitude === null
    ) {
      window.alert(
        '이 장소는 위치 정보가 없어 코스에 추가할 수 없습니다.',
      );
      return;
    }

    // null 검사가 끝난 후 별도 변수에 저장
    // TypeScript에서도 number로 확실하게 인식할 수 있음
    const latitude = placeInfo.latitude;
    const longitude = placeInfo.longitude;

    const newPlace: CoursePlace = {
      id: Date.now(),
      name: placeInfo.title,
      address: placeInfo.address,
      latitude,
      longitude,
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
      await updateCourse(
        selectedCourse.id,
        updatedCourse,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : '코스 저장에 실패했습니다.',
      );
      return;
    }

    navigate(`/place-guide/${placeId}`);
  };

  /* =========================
     화면
  ========================= */

  return (
    <div className="place-guide-add-to-course-page">
      <Header />

      <BackHeader
        title="내 코스에 추가하기"
        onBack={() => navigate(`/place-guide/${placeId}`)}
      />

      {isLoading || isCoursesLoading ? (
        <p className="place-guide-add-to-course-page__empty">
          불러오는 중...
        </p>
      ) : !placeInfo ? (
        <p className="place-guide-add-to-course-page__empty">
          장소를 찾을 수 없습니다.
        </p>
      ) : courses.length === 0 ? (
        <p className="place-guide-add-to-course-page__empty">
          저장된 코스가 없습니다.
        </p>
      ) : (
        <>
          {/* =========================
              코스 선택
          ========================= */}

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
                  aria-pressed={
                    course.id === selectedCourseId
                  }
                >
                  <span className="place-guide-add-to-course-page__course-name">
                    {course.name}
                  </span>

                  <span className="place-guide-add-to-course-page__day-count">
                    {course.days.length}일 일정
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* =========================
              DAY / 위치 선택
          ========================= */}

          {selectedCourse && selectedDay && (
            <section
              className="place-guide-add-to-course-page__selection"
              aria-label="추가 위치 선택"
            >
              {/* DAY 선택 */}
              <div className="place-guide-add-to-course-page__selection-group">
                <strong>추가할 DAY</strong>

                <div className="place-guide-add-to-course-page__choices">
                  {selectedCourse.days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      className={
                        day.id === selectedDay.id
                          ? 'is-selected'
                          : ''
                      }
                      onClick={() => handleSelectDay(day.id)}
                      aria-pressed={
                        day.id === selectedDay.id
                      }
                    >
                      DAY {day.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 위치 선택 */}
              <div className="place-guide-add-to-course-page__selection-group">
                <strong>추가 위치</strong>

                <div className="place-guide-add-to-course-page__choices place-guide-add-to-course-page__choices--positions">
                  {Array.from(
                    {
                      length: selectedDay.places.length + 1,
                    },
                    (_, index) => {
                      const label =
                        index === 0
                          ? '맨 앞'
                          : index ===
                              selectedDay.places.length
                            ? '맨 뒤'
                            : `${selectedDay.places[index - 1].name} 뒤`;

                      return (
                        <button
                          key={index}
                          type="button"
                          className={
                            index === insertIndex
                              ? 'is-selected'
                              : ''
                          }
                          onClick={() =>
                            setInsertIndex(index)
                          }
                          aria-pressed={
                            index === insertIndex
                          }
                        >
                          {label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* 추가 버튼 */}
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