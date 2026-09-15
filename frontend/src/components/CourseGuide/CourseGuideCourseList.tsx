import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { getCourses } from '@/api/courseGuide';
import type { CourseSummary } from '@/api/courseGuide';
import './CourseGuideCourseList.css';

interface CourseGuideCourseListProps {
  keyword: string; // 빈 문자열이면 인천 전체 코스, 값 있으면 그 키워드로 검색
}

// "코스 목록" 탭에서 보여지는 컴포넌트 - 관광공사 API 연동
function CourseGuideCourseList({ keyword }: CourseGuideCourseListProps) {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);
    setHasError(false);

    getCourses(keyword || undefined)
      .then((data) => {
        if (!isCancelled) {
          setCourses(data);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [keyword]);

  if (isLoading) {
    return (
      <p style={{ textAlign: 'center', padding: '40px 0', color: '#828585' }}>
        코스를 불러오는 중...
      </p>
    );
  }

  if (hasError) {
    return (
      <p style={{ textAlign: 'center', padding: '40px 0', color: '#828585' }}>
        코스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '40px 0', color: '#828585' }}>
        {keyword ? '검색 결과가 없습니다.' : '등록된 코스가 없습니다.'}
      </p>
    );
  }

  return (
    <ul className="course-guide-course-list">
      {courses.map((course) => (
        <li key={course.courseId} className="course-guide-course-item-wrap">
          <Link to={`/course-guide/${course.courseId}`} className="course-guide-course-item">
            {course.isBookmarked && (
              <span className="course-guide-course-bookmark-badge" aria-label="북마크된 코스">
                <Bookmark size={18} fill="currentColor" />
              </span>
            )}

            <p className="course-guide-course-name">{course.name}</p>
            <p className="course-guide-course-desc">{course.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CourseGuideCourseList;
