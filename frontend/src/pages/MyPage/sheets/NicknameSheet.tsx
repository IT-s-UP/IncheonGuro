import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

const MAX_LENGTH = 5;
const NICKNAME_REGEX = /^[A-Za-z0-9가-힣ㄱ-ㅎ]{2,5}$/;

interface NicknameSheetProps {
  value: string;
  onSave: (value: string) => void;
}

function NicknameSheet({ value, onSave }: NicknameSheetProps) {
  const [draft, setDraft] = useState(value);
  const isValid = NICKNAME_REGEX.test(draft);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        닉네임
      </Typography>

      <Input
        className="profile-sheet__input"
        value={draft}
        maxLength={MAX_LENGTH}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="닉네임을 입력해주세요"
      />
      <Typography
        as="span"
        variant="caption1"
        color={draft && !isValid ? '#e05555' : '#878787'}
        className="profile-sheet__counter"
      >
        {draft.length}/{MAX_LENGTH}
      </Typography>
      {draft && !isValid && (
        <Typography as="p" variant="caption1" color="#e05555" className="profile-sheet__error">
          영문, 한글, 숫자 2~5자로 입력해주세요.
        </Typography>
      )}

      <Button
        size="middle"
        className="profile-sheet__confirm-btn"
        onClick={() => onSave(draft)}
        disabled={!isValid}
      >
        확인
      </Button>
    </div>
  );
}

export default NicknameSheet;
