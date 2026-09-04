import Button from '@/components/Button/Button';

import './CourseGuideSheetActions.css';

interface CourseGuideSheetActionsProps {
  onAddPlace: () => void;
  onSaveCourse: () => void;
}

function CourseGuideSheetActions({ onAddPlace, onSaveCourse }: CourseGuideSheetActionsProps) {
  return (
    <div className="course-guide-detail-page__actions">
      <Button size="sub" variant="primary" onClick={onAddPlace}>
        <span className="course-guide-detail-page__button-content">
          <svg
            className="course-guide-detail-page__button-icon"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M5.5 9H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>장소 추가하기</span>
        </span>
      </Button>

      <Button size="sub" variant="primary" onClick={onSaveCourse}>
        <span className="course-guide-detail-page__button-content">
          <svg
            className="course-guide-detail-page__button-icon"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M5.5 9L8 11.5L12.5 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>코스 저장하기</span>
        </span>
      </Button>
    </div>
  );
}

export default CourseGuideSheetActions;
