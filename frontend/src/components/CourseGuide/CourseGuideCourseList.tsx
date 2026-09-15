import { accountStorage } from '@/auth/accountStorage';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { mockCourses } from '@/mocks/courseguide';
import './CourseGuideCourseList.css';

const BOOKMARKED_COURSE_IDS_KEY = 'incheonguro-bookmarked-course-ids';

function loadBookmarkedCourseIds(): number[] {
  const raw = accountStorage.getItem(BOOKMARKED_COURSE_IDS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as number[]) : [];
  } catch {
    return [];
  }
}

// "코스 목록" 탭에서 보여지는 컴포넌트
function CourseGuideCourseList() {
  const [bookmarkedIds] = useState<number[]>(loadBookmarkedCourseIds);

  return (
    <ul className="course-guide-course-list">
      {mockCourses.map((course) => {
        const isBookmarked = bookmarkedIds.includes(course.courseId);

        return (
          <li key={course.courseId} className="course-guide-course-item-wrap">
            <Link to={`/course-guide/${course.courseId}`} className="course-guide-course-item">
              {isBookmarked && (
                <span className="course-guide-course-bookmark-badge" aria-label="북마크된 코스">
                  <Bookmark size={18} fill="currentColor" />
                </span>
              )}

              <p className="course-guide-course-name">{course.name}</p>
              <p className="course-guide-course-desc">{course.description}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default CourseGuideCourseList;
