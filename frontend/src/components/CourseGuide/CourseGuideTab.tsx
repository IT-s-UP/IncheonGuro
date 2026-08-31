import './CourseGuideTab.css';

// 타입 두 개 선언 (각각 탭 버튼)
export type CourseGuideTabType = 'recommend' | 'list';

// CourseGuideListPage.tsx로부터 내려받는 props
interface CourseGuideTabProps {
  activeTab: CourseGuideTabType;
  onChange: (tab: CourseGuideTabType) => void;
}

function CourseGuideTab({ activeTab, onChange }: CourseGuideTabProps) {
  return (
    <div className="course-guide-tab-bar">
      <button
        className={`course-guide-tab-item ${activeTab === 'recommend' ? 'active' : ''}`}
        onClick={() => onChange('recommend')}
      >
        코스 추천
      </button>
      <button
        className={`course-guide-tab-item ${activeTab === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
      >
        코스 목록
      </button>
    </div>
  );
}

export default CourseGuideTab;
