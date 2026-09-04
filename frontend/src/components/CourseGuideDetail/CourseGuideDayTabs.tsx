import type { CourseDay } from '@/pages/MyCourses/types';

import './CourseGuideDayTabs.css';

interface CourseGuideDayTabsProps {
  days: CourseDay[];
  selectedDayId: number;
  onSelectDay: (dayId: number) => void;
  onAddDay: () => void;
}

function CourseGuideDayTabs({
  days,
  selectedDayId,
  onSelectDay,
  onAddDay,
}: CourseGuideDayTabsProps) {
  return (
    <div className="course-guide-detail-page__day-tabs">
      {days.map((courseDay) => {
        const isActive = courseDay.id === selectedDayId;

        return (
          <button
            className={[
              'course-guide-detail-page__day-tab',
              isActive ? 'course-guide-detail-page__day-tab--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            key={courseDay.id}
            aria-pressed={isActive}
            onClick={() => onSelectDay(courseDay.id)}
          >
            DAY {courseDay.day}
          </button>
        );
      })}

      <button className="course-guide-detail-page__day-add" type="button" onClick={onAddDay}>
        ＋ DAY 추가
      </button>
    </div>
  );
}

export default CourseGuideDayTabs;
