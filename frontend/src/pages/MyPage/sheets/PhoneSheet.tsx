import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

interface PhoneSheetProps {
  value: string;
  onSave: (value: string) => void;
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);

  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function PhoneSheet({ value, onSave }: PhoneSheetProps) {
  const [draft, setDraft] = useState(value);
  const isValid = /^01[0-9]-\d{3,4}-\d{4}$/.test(draft);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        전화번호
      </Typography>

      <Input
        className="profile-sheet__input"
        value={draft}
        type="tel"
        onChange={(event) => setDraft(formatPhone(event.target.value))}
        placeholder="010-0000-0000"
      />

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

export default PhoneSheet;
