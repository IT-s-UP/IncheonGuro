import Typography from '@/components/Typography/Typography';
import type { CourseDay } from '@/pages/MyCourses/types';

import './CourseGuideRouteMap.css';

interface CourseGuideRouteMapProps {
  selectedDay: CourseDay;
}

function CourseGuideRouteMap({ selectedDay }: CourseGuideRouteMapProps) {
  return (
    <section
      className="course-guide-detail-page__map"
      aria-label={`DAY ${selectedDay.day} 코스 지도`}
    >
      {selectedDay.places.length === 0 && (
        <div className="course-guide-detail-page__map-placeholder">
          <Typography variant="subtitle3">DAY {selectedDay.day} 지도</Typography>

          <Typography variant="caption2" color="#828585">
            장소를 추가해주세요.
          </Typography>
        </div>
      )}

      <div className="course-guide-detail-page__map-route">
        {selectedDay.places.slice(0, 4).map((place, index) => (
          <span
            className="course-guide-detail-page__map-pin"
            key={place.id}
            style={{
              top: `${28 + index * 52}px`,
              left: `${145 + index * 25}px`,
            }}
            aria-hidden="true"
          >
            {index + 1}
          </span>
        ))}
      </div>
    </section>
  );
}

export default CourseGuideRouteMap;
