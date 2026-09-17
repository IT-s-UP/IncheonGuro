import type { ChangeEvent, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import './CourseGuideSearchBox.css';

interface CourseGuideSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

function CourseGuideSearchBox({ value, onChange, onSubmit }: CourseGuideSearchBoxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="course-guide-search-box">
      {/* 검색 입력 input 창 부분 - 이제 제어 컴포넌트, Enter 치면 검색 실행 */}
      <input
        className="course-guide-search-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="코스 이름을 검색해보세요"
      />
      {/* 돋보기 아이콘 부분 - 클릭해도 검색 실행 */}
      <Search
        className="course-guide-search-icon"
        size={20}
        onClick={onSubmit}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}

export default CourseGuideSearchBox;
