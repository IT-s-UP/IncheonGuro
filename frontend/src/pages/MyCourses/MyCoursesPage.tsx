import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BackHeader from '@/components/Header/BackHeader';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import Typography from '@/components/Typography/Typography';

import CourseEditPage from './CourseEdit/CourseEditPage';
import type { Course, CourseCost, CourseDay, CoursePlace, Transport } from './types';

import './MyCoursesPage.css';

const STORAGE_KEY = 'incheonguro-my-courses';

const EMPTY_COSTS: CourseCost = {
  transportation: 0,
  food: 0,
  admission: 0,
  etc: 0,
};

const SAMPLE_PLACES: CoursePlace[] = [
  {
    id: 101,
    name: '청라호수공원',
    address: '인천광역시 서구 청라대로 204',
  },
  {
    id: 102,
    name: '정서진중앙시장',
    address: '인천광역시 서구 원창로239번길 11',
  },
  {
    id: 103,
    name: '아라뱃길 전망대',
    address: '인천광역시 서구 정서진1로 41',
  },
];

interface LegacyCourse {
  id?: number;
  name?: string;
  transport?: Transport;
  places?: CoursePlace[];
  days?: CourseDay[];
}

function createCourseDay(day: number, includeSamplePlaces = false): CourseDay {
  return {
    id: Date.now() + day,
    day,
    transport: '대중교통',
    places: includeSamplePlaces
      ? SAMPLE_PLACES.map((place) => ({
          ...place,
          id: place.id + day * 100,
        }))
      : [],
    costs: includeSamplePlaces
      ? {
          transportation: 8000,
          food: 30000,
          admission: 15000,
          etc: 5000,
        }
      : { ...EMPTY_COSTS },
  };
}

function createInitialDays(includeSamplePlaces = false): CourseDay[] {
  return [1, 2, 3].map((day) => createCourseDay(day, includeSamplePlaces && day === 1));
}

const defaultCourses: Course[] = [
  {
    id: 1,
    name: '내 코스 1',
    days: createInitialDays(true),
  },
  {
    id: 2,
    name: '내 코스 2',
    days: createInitialDays(false),
  },
  {
    id: 3,
    name: '내 코스 3',
    days: createInitialDays(false),
  },
];

function normalizeCourse(storedCourse: LegacyCourse, index: number): Course {
  const courseId = typeof storedCourse.id === 'number' ? storedCourse.id : Date.now() + index;

  const courseName =
    typeof storedCourse.name === 'string' ? storedCourse.name : `내 코스 ${index + 1}`;

  if (Array.isArray(storedCourse.days) && storedCourse.days.length > 0) {
    return {
      id: courseId,
      name: courseName,
      days: storedCourse.days.map((courseDay, dayIndex) => ({
        id: typeof courseDay.id === 'number' ? courseDay.id : courseId + dayIndex + 1,
        day: dayIndex + 1,
        transport: courseDay.transport ?? '대중교통',
        places: Array.isArray(courseDay.places) ? courseDay.places : [],
        costs: {
          ...EMPTY_COSTS,
          ...(courseDay.costs ?? {}),
        },
      })),
    };
  }

  // 기존 places/transport 구조를 DAY 1 구조로 변환합니다.
  return {
    id: courseId,
    name: courseName,
    days: [
      {
        id: courseId * 100 + 1,
        day: 1,
        transport: storedCourse.transport ?? '대중교통',
        places: Array.isArray(storedCourse.places) ? storedCourse.places : [],
        costs: { ...EMPTY_COSTS },
      },
    ],
  };
}

function loadCourses(): Course[] {
  const savedCourses = localStorage.getItem(STORAGE_KEY);

  if (!savedCourses) {
    return defaultCourses;
  }

  try {
    const parsedCourses: unknown = JSON.parse(savedCourses);

    if (!Array.isArray(parsedCourses)) {
      return defaultCourses;
    }

    return parsedCourses.map((storedCourse, index) =>
      normalizeCourse(storedCourse as LegacyCourse, index),
    );
  } catch {
    return defaultCourses;
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M14.2939 12.5786H13.3905L13.0703 12.2699C14.191 10.9663 14.8656 9.27387 14.8656 7.43282C14.8656 3.32762 11.538 0 7.43282 0C3.32762 0 0 3.32762 0 7.43282C0 11.538 3.32762 14.8656 7.43282 14.8656C9.27387 14.8656 10.9663 14.191 12.2699 13.0703L12.5786 13.3905V14.2939L18.2962 20L20 18.2962L14.2939 12.5786ZM7.43282 12.5786C4.58548 12.5786 2.28702 10.2802 2.28702 7.43282C2.28702 4.58548 4.58548 2.28702 7.43282 2.28702C10.2802 2.28702 12.5786 4.58548 12.5786 7.43282C12.5786 10.2802 10.2802 12.5786 7.43282 12.5786Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CirclePlusIcon() {
  return (
    <svg
      className="my-courses-page__button-icon"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />

      <path d="M9 5.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M5.5 9H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MyCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>(loadCourses);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return courses;
    }

    return courses.filter((course) => course.name.toLowerCase().includes(keyword));
  }, [courses, searchKeyword]);

  const createCourse = () => {
    setSelectedCourse({
      id: Date.now(),
      name: '새 코스',
      days: createInitialDays(false),
    });
  };

  const saveCourse = (savedCourse: Course) => {
    setCourses((currentCourses) => {
      const courseExists = currentCourses.some((course) => course.id === savedCourse.id);

      if (courseExists) {
        return currentCourses.map((course) =>
          course.id === savedCourse.id ? savedCourse : course,
        );
      }

      return [...currentCourses, savedCourse];
    });

    setSelectedCourse(null);
  };

  const deleteCourse = (courseId: number) => {
    setCourses((currentCourses) => currentCourses.filter((course) => course.id !== courseId));

    setDeleteTargetId(null);
  };

  const toggleDelete = (courseId: number) => {
    setDeleteTargetId((currentId) => (currentId === courseId ? null : courseId));
  };

  const toggleSearch = () => {
    setIsSearchOpen((current) => {
      if (current) {
        setSearchKeyword('');
      }

      return !current;
    });
  };

  if (selectedCourse) {
    return (
      <CourseEditPage
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onSave={saveCourse}
      />
    );
  }

  return (
    <main className="my-courses-page">
      <Header />

      <div className="my-courses-page__title">
        <BackHeader title="내 코스" onBack={() => navigate(-1)} />

        <button
          className="my-courses-page__search-button"
          type="button"
          aria-label={isSearchOpen ? '검색창 닫기' : '코스 검색'}
          aria-expanded={isSearchOpen}
          onClick={toggleSearch}
        >
          <SearchIcon />
        </button>
      </div>

      {isSearchOpen && (
        <div className="my-courses-page__search-field">
          <SearchIcon />

          <input
            type="search"
            value={searchKeyword}
            placeholder="코스 이름 검색"
            aria-label="코스 이름 검색"
            onChange={(event) => setSearchKeyword(event.target.value)}
            autoFocus
          />
        </div>
      )}

      <section className="my-courses-page__content">
        {filteredCourses.length === 0 ? (
          <div className="my-courses-page__empty">
            <Typography as="p" variant="subtitle2">
              {searchKeyword ? '검색 결과가 없어요.' : '저장된 코스가 없어요.'}
            </Typography>

            <Typography variant="p3" color="#828585">
              {searchKeyword
                ? '다른 코스 이름으로 검색해보세요.'
                : '새로운 여행 코스를 만들어보세요!'}
            </Typography>
          </div>
        ) : (
          <ul className="my-courses-page__list">
            {filteredCourses.map((course) => {
              const isDeleteOpen = deleteTargetId === course.id;

              return (
                <li
                  className={[
                    'my-courses-page__item',
                    isDeleteOpen ? 'my-courses-page__item--delete-open' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={course.id}
                >
                  <button
                    className="my-courses-page__course-button"
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <span className="my-courses-page__course-copy">
                      <Typography variant="p2">{course.name}</Typography>

                      <Typography variant="caption2" color="#828585">
                        {course.days.length}일 일정
                      </Typography>
                    </span>
                  </button>

                  {isDeleteOpen ? (
                    <button
                      className="my-courses-page__delete-button"
                      type="button"
                      onClick={() => deleteCourse(course.id)}
                      aria-label={`${course.name} 삭제`}
                    >
                      <TrashIcon />
                      <span>삭제</span>
                    </button>
                  ) : (
                    <button
                      className="my-courses-page__more-button"
                      type="button"
                      onClick={() => toggleDelete(course.id)}
                      aria-label={`${course.name} 삭제 메뉴 열기`}
                    >
                      •••
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="my-courses-page__bottom-action">
        <Button size="middle" variant="primary" onClick={createCourse}>
          <span className="my-courses-page__button-content">
            <CirclePlusIcon />
            <span>새 코스 추가하기</span>
          </span>
        </Button>
      </div>
    </main>
  );
}

export default MyCoursesPage;
