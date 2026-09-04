import Typography from '@/components/Typography/Typography';
import type { CoursePlace, Transport } from '@/pages/MyCourses/types';

import './CourseGuidePlaceList.css';

interface CourseGuidePlaceListProps {
  places: CoursePlace[];
  transport: Transport;
  editingPlaceId: number | null;
  actionMenuPlaceId: number | null;
  onChangePlaceName: (placeId: number, name: string) => void;
  onFinishEditingPlace: () => void;
  onToggleActionMenu: (placeId: number) => void;
  onStartEditPlace: (placeId: number) => void;
  onMovePlace: (index: number, direction: -1 | 1) => void;
  onDeletePlace: (placeId: number) => void;
}

function CourseGuidePlaceList({
  places,
  transport,
  editingPlaceId,
  actionMenuPlaceId,
  onChangePlaceName,
  onFinishEditingPlace,
  onToggleActionMenu,
  onStartEditPlace,
  onMovePlace,
  onDeletePlace,
}: CourseGuidePlaceListProps) {
  return (
    <ol className="course-guide-detail-page__place-list">
      {places.map((place, index) => {
        const isFirstPlace = index === 0;
        const isLastPlace = index === places.length - 1;
        const isActionMenuOpen = actionMenuPlaceId === place.id;

        const placeLabel = isFirstPlace ? '출발지' : isLastPlace ? '도착지' : `경유지 ${index}`;

        return (
          <li className="course-guide-detail-page__route-group" key={place.id}>
            <div className="course-guide-detail-page__place">
              <div className="course-guide-detail-page__timeline">
                <span
                  className="course-guide-detail-page__place-marker"
                  aria-label={`${index + 1}번째 장소`}
                />

                {!isLastPlace && (
                  <div className="course-guide-detail-page__timeline-line" aria-hidden="true" />
                )}
              </div>

              <div className="course-guide-detail-page__place-content">
                <div className="course-guide-detail-page__place-main">
                  <div className="course-guide-detail-page__place-info">
                    <Typography variant="caption2" color="#828585">
                      {placeLabel}
                    </Typography>

                    {editingPlaceId === place.id ? (
                      <input
                        className="course-guide-detail-page__place-input"
                        value={place.name}
                        maxLength={30}
                        onChange={(event) => onChangePlaceName(place.id, event.target.value)}
                        onBlur={onFinishEditingPlace}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            onFinishEditingPlace();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <Typography
                        as="strong"
                        variant="subtitle3"
                        className="course-guide-detail-page__place-name"
                      >
                        {place.name}
                      </Typography>
                    )}

                    <Typography
                      as="p"
                      variant="caption2"
                      color="#828585"
                      className="course-guide-detail-page__address"
                    >
                      {place.address}
                    </Typography>
                  </div>

                  <button
                    className="course-guide-detail-page__more-button"
                    type="button"
                    aria-label={`${place.name} 메뉴 열기`}
                    aria-expanded={isActionMenuOpen}
                    onClick={() => onToggleActionMenu(place.id)}
                  >
                    ⋯
                  </button>
                </div>

                {isActionMenuOpen && (
                  <div className="course-guide-detail-page__place-actions">
                    <button
                      type="button"
                      disabled={isFirstPlace}
                      onClick={() => onMovePlace(index, -1)}
                    >
                      위로
                    </button>

                    <button
                      type="button"
                      disabled={isLastPlace}
                      onClick={() => onMovePlace(index, 1)}
                    >
                      아래로
                    </button>

                    <button type="button" onClick={() => onStartEditPlace(place.id)}>
                      수정
                    </button>

                    <button
                      className="course-guide-detail-page__delete"
                      type="button"
                      onClick={() => onDeletePlace(place.id)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isLastPlace && (
              <div className="course-guide-detail-page__transport-step">
                <div className="course-guide-detail-page__transport-timeline">
                  <span className="course-guide-detail-page__transport-marker" aria-hidden="true" />
                </div>

                <div className="course-guide-detail-page__transport-info">
                  <Typography as="strong" variant="caption1">
                    {transport}
                  </Typography>

                  <Typography as="p" variant="caption2" color="#828585">
                    약 10분 · 예상 이동 시간
                  </Typography>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default CourseGuidePlaceList;
