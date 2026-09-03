import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { TransportMode } from '@/mocks/courseRoute';
import Header from '@/components/Header/Header';
import CourseGuideBackButton from '@/components/CourseGuide/CourseGuideBackButton';
import CourseGuideTransportTab from '@/components/CourseGuide/CourseGuideTransportTab';
import CourseGuideRoutePanel from '@/components/CourseGuide/CourseGuideRoutePanel';
import './CourseGuideDetailPage.css';

function CourseGuideDetailPage() {
  const { courseId } = useParams();
  const [activeMode, setActiveMode] = useState<TransportMode>('walk');

  return (
    <div className="course-guide-detail-page">
      <Header />
      <CourseGuideBackButton to="/course-guide" />
      <CourseGuideTransportTab activeMode={activeMode} onChange={setActiveMode} />

      {/* 지도 자리 - 실제 연동 전까지 회색 박스 */}
      <div className="detail-map-area">
        <div className="detail-map-placeholder">
          지도
          <br />
          (네비게이션)
        </div>

        <CourseGuideRoutePanel courseId={Number(courseId)} activeMode={activeMode} />
      </div>
    </div>
  );
}

export default CourseGuideDetailPage;
