import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

const MAX_LENGTH = 5;

interface NameSheetProps {
  value: string;
  onSave: (value: string) => void;
}

function NameSheet({ value, onSave }: NameSheetProps) {
  const [draft, setDraft] = useState(value);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        이름
      </Typography>

      <div className="profile-sheet__input-wrap">
        <Input
          className="profile-sheet__input"
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="이름을 입력해주세요"
        />
        <Typography as="span" variant="caption1" color="#878787" className="profile-sheet__counter">
          {draft.length}/{MAX_LENGTH}
        </Typography>
      </div>

      <Button
        size="middle"
        className="profile-sheet__confirm-btn"
        onClick={() => onSave(draft)}
        disabled={draft.trim().length === 0}
      >
        확인
      </Button>
    </div>
  );
}

export default NameSheet;
