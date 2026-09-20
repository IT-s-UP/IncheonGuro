import { useEffect, useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Button from '@/components/Button/Button';
import OptionTab from '@/components/Tab/OptionTab';
import { apiFetch } from '@/auth/api';
import './ProfileSheets.css';

export interface RegionValue {
  id: number | null;
  name: string;
}

interface RegionOption {
  id: number;
  regionName: string;
}

interface RegionSheetProps {
  value: RegionValue;
  onSave: (value: RegionValue) => void;
}

function RegionSheet({ value, onSave }: RegionSheetProps) {
  const [options, setOptions] = useState<RegionOption[]>([]);
  const [draft, setDraft] = useState<RegionValue>(value);

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/region')
      .then((response) => (response.ok ? response.json() : []))
      .then((data: RegionOption[]) => {
        if (!cancelled) setOptions(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        관심 구/군
      </Typography>

      <div className="profile-sheet__region-grid">
        {[...options]
          .sort((a, b) => a.regionName.localeCompare(b.regionName, 'ko'))
          .map((option) => (
          <OptionTab
            key={option.id}
            label={option.regionName}
            active={draft.id === option.id}
            onClick={() => setDraft({ id: option.id, name: option.regionName })}
          />
          ))}
      </div>

      <Button
        size="middle"
        className="profile-sheet__confirm-btn"
        onClick={() => onSave(draft)}
        disabled={draft.id === null}
      >
        확인
      </Button>
    </div>
  );
}

export default RegionSheet;
