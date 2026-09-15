import { accountStorage } from '@/auth/accountStorage';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import { getPlaceDetail } from '@/api/placeGuide';
import type { Course, CoursePlace } from '@/pages/MyCourses/types';

import './PlaceGuideAddToCoursePage.css';

const STORAGE_KEY = 'incheonguro-my-courses';

function loadMyCourses(): Course[] {
  const raw = accountStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMyCourses(courses: Course[]) {
  accountStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function PlaceGuideAddToCoursePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { placeId } = useParams();

  // 상세 페이지에서 이미 title을 들고 넘어왔으면 API 재호출 없이 바로 사용
  const placeTitleFromState = (location.state as { placeTitle?: string } | null)?.placeTitle;

  const [placeTitle, setPlaceTitle] = useState<string | null>(placeTitleFromState ?? null);
  const [isLoading, setIsLoading] = useState(!placeTitleFromState);

  const courses = loadMyCourses();

  // state로 넘어온 title이 없을 때만(예: 새로고침으로 state가 사라진 경우) API 호출
  useEffect(() => {
    if (placeTitleFromState || !placeId) return;

    getPlaceDetail(placeId)
      .then((data) => setPlaceTitle(data.title))
      .catch((error) => {
        console.error('장소 정보 조회 실패:', error);
        setPlaceTitle(null);
      })
      .finally(() => setIsLoading(false));
  }, [placeId, placeTitleFromState]);

  // 선택한 코스의 "가장 마지막 DAY" 맨 끝에 현재 장소를 추가
  const handleSelectCourse = (course: Course) => {
    const lastDayIndex = course.days.length - 1;
    const newPlace: CoursePlace = { id: Date.now(), name: placeTitle ?? '', address: '' };

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
      ) : !placeTitle ? (
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
