import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

import Typography from '@/components/Typography/Typography';
import type { CourseDay } from '@/pages/MyCourses/types';

import CourseGuidePlaceList from './CourseGuidePlaceList';
import CourseGuideSheetActions from './CourseGuideSheetActions';

import './CourseGuidePlaceSheet.css';

interface CourseGuidePlaceSheetProps {
  selectedDay: CourseDay;
  sheetHeight: number;
  isDragging: boolean;
  minSheetHeight: number;
  maxSheetHeight: number;
  onSheetPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSheetPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSheetPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSheetKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  editingPlaceId: number | null;
  actionMenuPlaceId: number | null;
  onChangePlaceName: (placeId: number, name: string) => void;
  onFinishEditingPlace: () => void;
  onToggleActionMenu: (placeId: number) => void;
  onStartEditPlace: (placeId: number) => void;
  onMovePlace: (index: number, direction: -1 | 1) => void;
  onDeletePlace: (placeId: number) => void;
  onAddPlace: () => void;
  onSaveCourse: () => void;
}

function CourseGuidePlaceSheet({
  selectedDay,
  sheetHeight,
  isDragging,
  minSheetHeight,
  maxSheetHeight,
  onSheetPointerDown,
  onSheetPointerMove,
  onSheetPointerUp,
  onSheetKeyDown,
  editingPlaceId,
  actionMenuPlaceId,
  onChangePlaceName,
  onFinishEditingPlace,
  onToggleActionMenu,
  onStartEditPlace,
  onMovePlace,
  onDeletePlace,
  onAddPlace,
  onSaveCourse,
}: CourseGuidePlaceSheetProps) {
  return (
    <section
      className={`course-guide-detail-page__sheet${
        isDragging ? ' course-guide-detail-page__sheet--dragging' : ''
      }`}
      style={{ height: sheetHeight }}
    >
      <div
        className="course-guide-detail-page__sheet-drag-area"
        role="slider"
        tabIndex={0}
        aria-label="경로 안내창 높이 조절"
        aria-valuemin={minSheetHeight}
        aria-valuemax={maxSheetHeight}
        aria-valuenow={Math.round(sheetHeight)}
        onPointerDown={onSheetPointerDown}
        onPointerMove={onSheetPointerMove}
        onPointerUp={onSheetPointerUp}
        onPointerCancel={onSheetPointerUp}
        onKeyDown={onSheetKeyDown}
      >
        <div className="course-guide-detail-page__sheet-handle" />
      </div>

      <div className="course-guide-detail-page__sheet-header">
        <Typography as="h2" variant="head3" className="course-guide-detail-page__route-title">
          DAY {selectedDay.day} 경로 안내
        </Typography>
      </div>

      <div className="course-guide-detail-page__sheet-body">
        {selectedDay.places.length === 0 ? (
          <div className="course-guide-detail-page__empty">
            <Typography variant="p2" color="#828585">
              DAY {selectedDay.day}에 장소를 추가해주세요.
            </Typography>
          </div>
        ) : (
          <CourseGuidePlaceList
            places={selectedDay.places}
            transport={selectedDay.transport}
            editingPlaceId={editingPlaceId}
            actionMenuPlaceId={actionMenuPlaceId}
            onChangePlaceName={onChangePlaceName}
            onFinishEditingPlace={onFinishEditingPlace}
            onToggleActionMenu={onToggleActionMenu}
            onStartEditPlace={onStartEditPlace}
            onMovePlace={onMovePlace}
            onDeletePlace={onDeletePlace}
          />
        )}
      </div>

      <CourseGuideSheetActions onAddPlace={onAddPlace} onSaveCourse={onSaveCourse} />
    </section>
  );
}

export default CourseGuidePlaceSheet;
