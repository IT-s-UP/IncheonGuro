// 코스 안내 페이지 - 코스 추천 탭
import { useState } from 'react';
import { mockRecommendedCourses } from '@/mocks/courseguide';
import './CourseGuideListPage.css';
import CourseGuideCourseList from '@/components/CourseGuide/CourseGuideCourseList';
import Button from '@/components/Button/Button';
import CourseGuideBackButton from '@/components/CourseGuide/CourseGuideBackButton';
import CourseGuideTab from '@/components/CourseGuide/CourseGuideTab';
import type { CourseGuideTabType } from '@/components/CourseGuide/CourseGuideTab';
import CourseGuideSearchBox from '@/components/CourseGuide/CourseGuideSearchBox';
import CourseGuideRouteList from '@/components/CourseGuide/CourseGuideRouteList';
import { RotateCw } from 'lucide-react';

function CourseGuideListPage() {
  // 탭 상태 변경 [코스 추천 | 코스 목록]
  const [activeTab, setActiveTab] = useState<CourseGuideTabType>('recommend');
  // "오늘의 추천 코스" 버튼 클릭 시 넘어가는 코스의 인덱스
  const [recommendIndex, setRecommendIndex] = useState(0);

  // 전체 추천 코스 개수
  const totalRecommend = mockRecommendedCourses.length;
  // 현재 인덱스에 해당하는 코스 MOCK 데이터 (이름, 설명, 장소 목록)
  const currentCourse = mockRecommendedCourses[recommendIndex];

  // 버튼 클릭 시 다음 추천 코스로 이동, 마지막 다음엔 다시 처음으로 복귀
  const handleNextRecommend = () => {
    setRecommendIndex((prev) => (prev + 1) % totalRecommend);
  };

  return (
    <div className="course-guide-list-page">
      {/* 할 일 : 공용 헤더 컴포넌트 추가하기 */}
      {/* 할 일 : 공용 뒤로가기 버튼 컴포넌트 + "코스 안내" 텍스트 추가하기 */}
      <CourseGuideBackButton />

      {/* 코스 추천 / 코스 목록 탭 버튼 컴포넌트 */}
      <CourseGuideTab activeTab={activeTab} onChange={setActiveTab} />

      {/* 검색창 컴포넌트 */}
      <CourseGuideSearchBox />

      {/* activeTab이 'recommend'면 추천 코스 화면, 아니면 목록 화면을 보여줌 */}
      {activeTab === 'recommend' ? (
        <div className="recommend-view">
          <h2 className="course-name">{currentCourse.name}</h2>

          {/* 간략 지도 - 실제 연동 전까진 그냥 회색 박스 */}
          <div className="map-placeholder">간략 지도</div>

          {/* 코스 경로 안내 컴포넌트 - 길어지면 스크롤 추가 */}
          <CourseGuideRouteList places={currentCourse.places} />

          {/* "오늘의 추천 코스 n/전체" 버튼 - 누르면 다음 코스로 새로고침 */}
          <div className="recommend-button-wrap">
            <Button size="main" variant="primary" onClick={handleNextRecommend}>
              <span className="recommend-btn-content">
                <RotateCw className="refresh-icon" size={16} />
                오늘의 추천 코스 {recommendIndex + 1}/{totalRecommend}
              </span>
            </Button>
          </div>
        </div>
      ) : (
        <CourseGuideCourseList />
      )}
    </div>
  );
}

export default CourseGuideListPage;
