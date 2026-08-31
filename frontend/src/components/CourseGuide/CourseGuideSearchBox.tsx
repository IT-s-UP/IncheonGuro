import { Search } from 'lucide-react';
import './CourseGuideSearchBox.css';

function CourseGuideSearchBox() {
  return (
    <div className="course-guide-search-box">
      {/* 검색 입력 input 창 부분 */}
      <input className="course-guide-search-input" />
      {/* 돋보기 아이콘 부분 */}
      <Search className="course-guide-search-icon" size={20} />
    </div>
  );
}

export default CourseGuideSearchBox;
