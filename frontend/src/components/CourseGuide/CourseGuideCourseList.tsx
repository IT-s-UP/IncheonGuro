import { Link } from 'react-router-dom';
import { mockCourses } from '@/mocks/courseguide';
import './CourseGuideCourseList.css';

// "코스 목록" 탭에서 보여지는 컴포넌트
function CourseGuideCourseList() {
  return (
    <ul className="course-guide-course-list">
      {mockCourses.map((course) => (
        // 칸 하나하나를 감싸는 wrapper(li)
        <li key={course.courseId} className="course-guide-course-item-wrap">
          {/* 클릭하면 해당 코스의 상세 페이지(/course-guide/:courseId)로 이동 */}
          <Link to={`/course-guide/${course.courseId}`} className="course-guide-course-item">
            <p className="course-guide-course-name">{course.name}</p>
            <p className="course-guide-course-desc">{course.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default CourseGuideCourseList;
