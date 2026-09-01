import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Button from '@/components/Button/Button';
import OptionTab from '@/components/Tab/OptionTab';
import './ProfileSheets.css';

const REGION_OPTIONS = [
  '제물포구',
  '영종구',
  '미추홀구',
  '연수구',
  '남동구',
  '부평구',
  '계양구',
  '서해구',
  '검단구',
  '강화군',
  '옹진군',
  '없음',
];

interface RegionSheetProps {
  value: string;
  onSave: (value: string) => void;
}

function RegionSheet({ value, onSave }: RegionSheetProps) {
  const [draft, setDraft] = useState(value);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        관심 구/군
      </Typography>

      <div className="profile-sheet__region-grid">
        {REGION_OPTIONS.map((option) => (
          <OptionTab
            key={option}
            label={option}
            active={draft === option}
            onClick={() => setDraft(option)}
          />
        ))}
      </div>

      <Button size="middle" className="profile-sheet__confirm-btn" onClick={() => onSave(draft)}>
        확인
      </Button>
    </div>
  );
}

export default RegionSheet;
