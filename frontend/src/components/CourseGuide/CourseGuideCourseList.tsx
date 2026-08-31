import { mockCourses } from '@/mocks/courseguide';
import './CourseGuideCourseList.css';

// "코스 목록" 탭에서 보여지는 컴포넌트
function CourseGuideCourseList() {
  return (
    <ul className="course-guide-course-list">
      {mockCourses.map((course) => (
        // 칸 하나하나를 감싸는 wrapper(li)
        <li key={course.courseId} className="course-guide-course-item-wrap">
          {/* 실제 눈에 보이는 각 코스 목록 박스 - 코스 이름, 코스 설명 */}
          <div className="course-guide-course-item">
            <p className="course-guide-course-name">{course.name}</p>
            <p className="course-guide-course-desc">{course.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default CourseGuideCourseList;
