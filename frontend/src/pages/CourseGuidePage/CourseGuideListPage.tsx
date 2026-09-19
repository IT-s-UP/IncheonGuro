// 코스 안내 페이지 - 코스 목록
import { useState } from 'react';
import { Search } from 'lucide-react';
import './CourseGuideListPage.css';

import Header from '@/components/Header/Header';
import CourseGuideCourseList from '@/components/CourseGuide/CourseGuideCourseList';
import CourseGuideBackButton from '@/components/CourseGuide/CourseGuideBackButton';

function CourseGuideListPage() {
  // 검색어 입력과 동시에 목록을 필터링한다.
  const [keyword, setKeyword] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen((current) => {
      if (current) {
        setKeyword('');
      }

      return !current;
    });
  };

  return (
    <div className="course-guide-list-page">
      {/* 높이가 고정된 상단 영역 */}
      <div className="course-guide-list-page__top">
        <Header />

        <div className="course-guide-list-page__title">
          <CourseGuideBackButton />
          <button
            className="course-guide-list-page__search-button"
            type="button"
            aria-label={isSearchOpen ? '검색창 닫기' : '코스 검색'}
            aria-expanded={isSearchOpen}
            onClick={toggleSearch}
          >
            <Search />
          </button>
        </div>

        {isSearchOpen && (
          <div className="course-guide-list-page__search-field">
            <Search />
            <input
              type="search"
              value={keyword}
              placeholder="코스 이름 검색"
              aria-label="코스 이름 검색"
              autoFocus
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        )}
      </div>

      {/* 남는 공간을 전부 차지하고, 내용이 넘치면 이 영역만 스크롤됨 */}
      <div className="course-guide-list-page__content">
        <CourseGuideCourseList keyword={keyword} />
      </div>
    </div>
  );
}

export default CourseGuideListPage;
