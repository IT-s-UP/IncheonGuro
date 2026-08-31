import type { Place } from '@/mocks/courseguide';
import './CourseGuideRouteList.css';

// CourseGuideListPage.tsx로부터 내려받는 props
interface CourseGuideRouteListProps {
  places: Place[];
}

function CourseGuideRouteList({ places }: CourseGuideRouteListProps) {
  return (
    // 크기 고정하기 -> 피그마에서 프레임처럼!
    <div className="course-guide-route-list-wrap">
      {/* 코스 경로가 좀 많아지면 스크롤 */}
      <div className="course-guide-route-scroll">
        <ul className="course-guide-route-list">
          <div className="course-guide-route-line" />
          {places.map((place) => (
            <li key={place.name} className="course-guide-route-item">
              <div className="course-guide-route-marker-area">
                <span className="course-guide-route-marker" />
              </div>
              {/* 장소 이름 + 주소 글자 */}
              <div className="course-guide-route-text">
                <p className="course-guide-route-name">{place.name}</p>
                <p className="course-guide-route-address">{place.address}</p>
              </div>
              {/* 오른쪽 사진 자리 (실제 연동 전까지 회색 박스) */}
              <div className="course-guide-route-thumb" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CourseGuideRouteList;
