import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import Typography from '@/components/Typography/Typography';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

interface PasswordSheetProps {
  onSave: (currentPassword: string, newPassword: string) => void;
}

const CHECKS: { key: string; label: string; test: (value: string) => boolean }[] = [
  { key: 'length', label: '8자 이상', test: (v) => v.length >= 8 },
  { key: 'alpha', label: '영문 포함', test: (v) => /[a-zA-Z]/.test(v) },
  { key: 'digit', label: '숫자 포함', test: (v) => /[0-9]/.test(v) },
  { key: 'special', label: '특수문자 포함', test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

function PasswordSheet({ onSave }: PasswordSheetProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isStrong = CHECKS.every((check) => check.test(password));
  const hasConfirmInput = confirm.length > 0;
  const isMatch = password.length > 0 && password === confirm;

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        비밀번호
      </Typography>

      <div className="profile-sheet__password-field">
        <Input
          className="profile-sheet__input"
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="현재 비밀번호"
        />
        <button
          type="button"
          className="profile-sheet__password-eye"
          onClick={() => setShowCurrentPassword((prev) => !prev)}
          aria-label={showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
        >
          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="profile-sheet__password-field">
        <Input
          className="profile-sheet__input"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="새 비밀번호"
        />
        <button
          type="button"
          className="profile-sheet__password-eye"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        <div className="profile-sheet__password-checklist">
          {CHECKS.map((check) => {
            const done = check.test(password);
            return (
              <Typography
                key={check.key}
                as="span"
                variant="caption1"
                className={[
                  'profile-sheet__password-check-item',
                  done ? 'profile-sheet__password-check-item--done' : '',
                ].join(' ')}
              >
                {done ? '✓' : '○'} {check.label}
              </Typography>
            );
          })}
        </div>
      </div>

      <div className="profile-sheet__password-field">
        <Input
          className="profile-sheet__input"
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="새 비밀번호 확인"
        />
        <button
          type="button"
          className="profile-sheet__password-eye"
          onClick={() => setShowConfirm((prev) => !prev)}
          aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
        >
          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        {hasConfirmInput && (
          <Typography
            as="span"
            variant="caption1"
            className={[
              'profile-sheet__password-match',
              isMatch ? 'profile-sheet__password-match--ok' : 'profile-sheet__password-match--fail',
            ].join(' ')}
          >
            {isMatch ? '✓ 비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
          </Typography>
        )}
      </div>

      <Button
        size="middle"
        className="profile-sheet__confirm-btn"
        onClick={() => onSave(currentPassword, password)}
        disabled={currentPassword.length === 0 || !isStrong || !isMatch}
      >
        확인
      </Button>
    </div>
  );
}

export default PasswordSheet;
