import LineTab from '@/components/Tab/LineTab';
import type { Transport } from '@/pages/MyCourses/types';

import './CourseGuideDetailTransportTabs.css';

interface CourseGuideDetailTransportTabsProps {
  options: Transport[];
  activeTransport: Transport;
  onChange: (transport: Transport) => void;
}

function CourseGuideDetailTransportTabs({
  options,
  activeTransport,
  onChange,
}: CourseGuideDetailTransportTabsProps) {
  const activeIndex = options.indexOf(activeTransport);

  return (
    <div className="course-guide-detail-page__tabs">
      <LineTab
        items={options}
        activeIndex={activeIndex}
        onChange={(index) => {
          const selectedTransport = options[index];

          if (selectedTransport) {
            onChange(selectedTransport);
          }
        }}
      />
    </div>
  );
}

export default CourseGuideDetailTransportTabs;
