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

  const [isLoading, setIsLoading] = useState(!placeInfoFromState?.placeTitle);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);

  /* =========================
     내 코스 목록 조회
  ========================= */

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setIsCoursesLoading(false));
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
     코스에 장소 추가
  ========================= */

  const handleSelectCourse = async (course: Course) => {
    if (!placeInfo) {
      return;
    }

    /*
     * 좌표가 없는 장소는 CoursePlace에 넣을 수 없음.
     *
     * CoursePlace의 latitude / longitude가
     * number 타입이기 때문에 여기서 한 번 검사한다.
     */
    if (placeInfo.latitude === null || placeInfo.longitude === null) {
      window.alert('이 장소는 위치 정보가 없어 코스에 추가할 수 없습니다.');
      return;
    }

    const lastDayIndex = course.days.length - 1;

    const newPlace: CoursePlace = {
      id: Date.now(),
      name: placeInfo.title,
      address: placeInfo.address,
      latitude: placeInfo.latitude,
      longitude: placeInfo.longitude,
    };

    const updatedCourse: Course = {
      ...course,
      days: course.days.map((day, index) =>
        index === lastDayIndex
          ? {
              ...day,
              places: [...day.places, newPlace],
            }
          : day,
      ),
    };

    try {
      await updateCourse(course.id, updatedCourse);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '코스 저장에 실패했습니다.');
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

      <BackHeader title="내 코스에 추가하기" onBack={() => navigate(`/place-guide/${placeId}`)} />

      {isLoading || isCoursesLoading ? (
        <p className="place-guide-add-to-course-page__empty">불러오는 중...</p>
      ) : !placeInfo ? (
        <p className="place-guide-add-to-course-page__empty">장소를 찾을 수 없습니다.</p>
      ) : courses.length === 0 ? (
        <p className="place-guide-add-to-course-page__empty">저장된 코스가 없습니다.</p>
      ) : (
        <ul className="place-guide-add-to-course-page__list">
          {courses.map((course) => (
            <li key={course.id}>
              <button
                type="button"
                className="place-guide-add-to-course-page__course-btn"
                onClick={() => handleSelectCourse(course)}
              >
                <span className="place-guide-add-to-course-page__course-name">{course.name}</span>

                <span className="place-guide-add-to-course-page__day-count">
                  {course.days.length}일 일정
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlaceGuideAddToCoursePage;
