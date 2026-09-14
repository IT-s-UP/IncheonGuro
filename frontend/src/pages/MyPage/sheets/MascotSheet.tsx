import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Button from '@/components/Button/Button';
import { MASCOTS } from '@/assets/mascots';
import './ProfileSheets.css';

interface MascotSheetProps {
  value: string | null;
  onSave: (mascot: string) => void;
}

function MascotSheet({ value, onSave }: MascotSheetProps) {
  const [draft, setDraft] = useState<string | null>(value);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        프로필 마스코트
      </Typography>

      <div className="profile-sheet__mascot-grid">
        {MASCOTS.map((mascot) => (
          <button
            key={mascot.key}
            type="button"
            className={[
              'profile-sheet__mascot-item',
              draft === mascot.key ? 'profile-sheet__mascot-item--selected' : '',
            ].join(' ')}
            onClick={() => setDraft(mascot.key)}
          >
            <img src={mascot.imageUrl} alt={mascot.name} />
            <Typography variant="caption1">{mascot.name}</Typography>
          </button>
        ))}
      </div>

      <Button
        size="middle"
        className="profile-sheet__confirm-btn"
        onClick={() => draft && onSave(draft)}
        disabled={draft === null}
      >
        확인
      </Button>
    </div>
  );
}

export default MascotSheet;
