import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

const GENDER_OPTIONS = ['남성', '여성'] as const;
type Gender = (typeof GENDER_OPTIONS)[number];

interface GenderSheetProps {
  value: Gender;
  onSave: (value: Gender) => void;
}

function GenderSheet({ value, onSave }: GenderSheetProps) {
  const [draft, setDraft] = useState<Gender>(value);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        성별
      </Typography>

      <div className="profile-sheet__radio-list">
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className="profile-sheet__radio-row"
            onClick={() => setDraft(option)}
          >
            <span
              className={[
                'profile-sheet__radio-dot',
                draft === option ? 'profile-sheet__radio-dot--selected' : '',
              ].join(' ')}
            />
            <Typography variant="p2">{option}</Typography>
          </button>
        ))}
      </div>

      <Button size="middle" className="profile-sheet__confirm-btn" onClick={() => onSave(draft)}>
        확인
      </Button>
    </div>
  );
}

export default GenderSheet;
export type { Gender };
