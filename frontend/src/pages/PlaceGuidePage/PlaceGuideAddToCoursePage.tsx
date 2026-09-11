import { useNavigate, useParams } from 'react-router-dom';

import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import { mockPlaces } from '@/mocks/place';
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

function PlaceGuideAddToCoursePage() {
  const navigate = useNavigate();
  const { placeId } = useParams();

  const place = mockPlaces.find((item) => item.id === Number(placeId));
  const courses = loadMyCourses();

  // 선택한 코스의 "가장 마지막 DAY" 맨 끝에 현재 장소를 추가
  const handleSelectCourse = (course: Course) => {
    const lastDayIndex = course.days.length - 1;
    const newPlace: CoursePlace = { id: Date.now(), name: place?.title ?? '', address: '' };

    const updatedCourse: Course = {
      ...course,
      days: course.days.map((day, index) =>
        index === lastDayIndex ? { ...day, places: [...day.places, newPlace] } : day,
      ),
    };

    const updatedCourses = courses.map((c) => (c.id === course.id ? updatedCourse : c));
    saveMyCourses(updatedCourses);

    // 추가 완료 후, 방금 보던 장소 상세 페이지로 되돌아감
    navigate(`/place-guide/${placeId}`);
  };

  return (
    <div className="place-guide-add-to-course-page">
      <Header />
      <BackHeader title="내 코스에 추가하기" onBack={() => navigate(`/place-guide/${placeId}`)} />

      {!place ? (
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
