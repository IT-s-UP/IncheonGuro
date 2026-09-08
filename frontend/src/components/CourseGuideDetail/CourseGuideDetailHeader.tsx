import type { PointerEvent as ReactPointerEvent } from 'react';
import { Bookmark } from 'lucide-react';
import BackHeader from '@/components/Header/BackHeader';

import './CourseGuideDetailHeader.css';

interface CourseGuideDetailHeaderProps {
  displayedCourseName: string;
  onBack: () => void;
  onTitleBarPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  isEditingCourseName: boolean;
  courseName: string;
  onChangeCourseName: (value: string) => void;
  onFinishEditingCourseName: () => void;
  onCancelEditingCourseName: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

function CourseGuideDetailHeader({
  displayedCourseName,
  onBack,
  onTitleBarPointerUp,
  isEditingCourseName,
  courseName,
  onChangeCourseName,
  onFinishEditingCourseName,
  onCancelEditingCourseName,
  isBookmarked,
  onToggleBookmark,
}: CourseGuideDetailHeaderProps) {
  return (
    <>
      <div className="course-guide-detail-page__title-bar" onPointerUp={onTitleBarPointerUp}>
        <BackHeader title={displayedCourseName} onBack={onBack} />

        <button
          className="course-guide-detail-page__bookmark-button"
          type="button"
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? '북마크 해제' : '코스 북마크'}
          onClick={onToggleBookmark}
        >
          <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {isEditingCourseName && (
        <div className="course-guide-detail-page__name-editor">
          <label htmlFor="course-guide-name">코스 이름</label>

          <input
            id="course-guide-name"
            value={courseName}
            maxLength={20}
            placeholder="코스 이름을 입력해주세요."
            onChange={(event) => onChangeCourseName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onFinishEditingCourseName();
              }

              if (event.key === 'Escape') {
                onCancelEditingCourseName();
              }
            }}
            autoFocus
          />

          <button
            className="course-guide-detail-page__name-complete"
            type="button"
            onClick={onFinishEditingCourseName}
          >
            완료
          </button>
        </div>
      )}
    </>
  );
}

export default CourseGuideDetailHeader;
