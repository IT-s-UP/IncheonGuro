import type { TransportMode } from '@/mocks/courseRoute';
import { TRANSPORT_MODE_LABEL } from '@/mocks/courseRoute';
import './CourseGuideTransportTab.css';

const TRANSPORT_MODES: TransportMode[] = ['walk', 'transit', 'bike', 'car'];

interface CourseGuideTransportTabProps {
  activeMode: TransportMode;
  onChange: (mode: TransportMode) => void;
}

function CourseGuideTransportTab({ activeMode, onChange }: CourseGuideTransportTabProps) {
  return (
    <div className="course-guide-transport-tab-bar">
      {TRANSPORT_MODES.map((mode) => (
        <button
          key={mode}
          className={`course-guide-transport-tab-item ${activeMode === mode ? 'active' : ''}`}
          onClick={() => onChange(mode)}
        >
          {TRANSPORT_MODE_LABEL[mode]}
        </button>
      ))}
    </div>
  );
}

export default CourseGuideTransportTab;
