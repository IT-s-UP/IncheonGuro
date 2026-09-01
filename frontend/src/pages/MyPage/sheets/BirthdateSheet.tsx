import { useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

export interface Birthdate {
  year: number;
  month: number;
  day: number;
}

interface BirthdateSheetProps {
  value: Birthdate;
  onSave: (value: Birthdate) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function BirthdateSheet({ value, onSave }: BirthdateSheetProps) {
  const [draft, setDraft] = useState<Birthdate>(value);
  const dayOptions = Array.from({ length: daysInMonth(draft.year, draft.month) }, (_, i) => i + 1);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        생년월일
      </Typography>

      <div className="profile-sheet__birthdate-row">
        <select
          className="profile-sheet__birthdate-select"
          value={draft.year}
          onChange={(event) => setDraft((prev) => ({ ...prev, year: Number(event.target.value) }))}
        >
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>

        <select
          className="profile-sheet__birthdate-select"
          value={draft.month}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              month: Number(event.target.value),
              day: Math.min(prev.day, daysInMonth(prev.year, Number(event.target.value))),
            }))
          }
        >
          {MONTH_OPTIONS.map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </select>

        <select
          className="profile-sheet__birthdate-select"
          value={draft.day}
          onChange={(event) => setDraft((prev) => ({ ...prev, day: Number(event.target.value) }))}
        >
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              {day}일
            </option>
          ))}
        </select>
      </div>

      <Button size="middle" className="profile-sheet__confirm-btn" onClick={() => onSave(draft)}>
        확인
      </Button>
    </div>
  );
}

export default BirthdateSheet;
