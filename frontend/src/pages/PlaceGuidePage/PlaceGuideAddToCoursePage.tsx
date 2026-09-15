import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import { getPlaceDetail } from '@/api/placeGuide';
import type { Course, CoursePlace } from '@/pages/MyCourses/types';

import './PlaceGuideAddToCoursePage.css';

const STORAGE_KEY = 'incheonguro-my-courses';

function loadMyCourses(): Course[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMyCourses(courses: Course[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

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

  const courses = loadMyCourses();

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

  // 선택한 코스의 "가장 마지막 DAY" 맨 끝에 현재 장소를 추가
  // address/latitude/longitude를 실제 값으로 채워서, RouteDuration이 지오코딩 없이(또는 정상적으로)
  // 이동시간을 계산할 수 있도록 함 (기존엔 address가 빈 문자열이라 "장소를 검색해 위치를
  // 선택해주세요" 에러가 났었음)
  const handleSelectCourse = (course: Course) => {
    if (!placeInfo) return;

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
        index === lastDayIndex ? { ...day, places: [...day.places, newPlace] } : day,
      ),
    };

    const updatedCourses = courses.map((c) => (c.id === course.id ? updatedCourse : c));
    saveMyCourses(updatedCourses);

    navigate(`/place-guide/${placeId}`);
  };

  return (
    <div className="place-guide-add-to-course-page">
      <Header />
      <BackHeader title="내 코스에 추가하기" onBack={() => navigate(`/place-guide/${placeId}`)} />

      {isLoading ? (
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
