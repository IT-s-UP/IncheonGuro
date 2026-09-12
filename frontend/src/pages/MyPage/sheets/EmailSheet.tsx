import { useEffect, useState } from 'react';

import Typography from '@/components/Typography/Typography';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import './ProfileSheets.css';

const DOMAIN_OPTIONS = ['gmail.com', 'naver.com', 'daum.net', '직접입력'];
const VERIFY_SECONDS = 179;

export interface EmailValue {
  id: string;
  domain: string;
}

interface EmailSheetProps {
  value: EmailValue;
  onSave: (value: EmailValue) => void;
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function EmailSheet({ value, onSave }: EmailSheetProps) {
  const [id, setId] = useState(value.id);
  const [domain, setDomain] = useState(value.domain);
  const [customDomain, setCustomDomain] = useState('');
  const [isDomainListOpen, setIsDomainListOpen] = useState(false);
  const [code, setCode] = useState('');
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (sentAt === null) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - sentAt) / 1000);
      setSecondsLeft(Math.max(VERIFY_SECONDS - elapsed, 0));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [sentAt]);

  const resolvedDomain = domain === '직접입력' ? customDomain : domain;
  const isEmailValid = id.trim().length > 0 && resolvedDomain.trim().length > 0;
  const isCodeSent = sentAt !== null;

  const handleSend = () => {
    setSentAt(Date.now());
    setCode('');
  };

  const handleSave = () => {
    onSave({ id, domain: resolvedDomain });
  };

  return (
    <div>
      <Typography as="p" variant="p1" className="profile-sheet__title">
        이메일
      </Typography>

      <div className="profile-sheet__email-row">
        <Input
          className="profile-sheet__email-id"
          value={id}
          onChange={(event) => setId(event.target.value)}
          placeholder="아이디"
        />
        <Typography variant="p2" className="profile-sheet__email-at">
          @
        </Typography>

        {domain === '직접입력' ? (
          <Input
            className="profile-sheet__email-domain"
            value={customDomain}
            onChange={(event) => setCustomDomain(event.target.value)}
            placeholder="도메인 입력"
          />
        ) : (
          <div className="profile-sheet__email-domain">
            <button
              type="button"
              className="profile-sheet__email-domain-trigger"
              onClick={() => setIsDomainListOpen((prev) => !prev)}
            >
              {domain}
            </button>

            {isDomainListOpen && (
              <div className="profile-sheet__email-domain-list">
                {DOMAIN_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="profile-sheet__email-domain-option"
                    onClick={() => {
                      setDomain(option);
                      setIsDomainListOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="profile-sheet__email-verify-row">
        <Input
          className="profile-sheet__email-code-input"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="인증번호 6자리"
          disabled={!isCodeSent}
        />
        <Button size="small" onClick={handleSend} disabled={!isEmailValid}>
          전송
        </Button>
      </div>

      {isCodeSent && (
        <div className="profile-sheet__email-verify-footer">
          <button type="button" className="profile-sheet__email-resend" onClick={handleSend}>
            인증번호 재전송
          </button>
          <Typography as="span" variant="caption1" className="profile-sheet__email-timer">
            {formatTimer(secondsLeft)}
          </Typography>
        </div>
      )}

      <Button
        size="middle"
        className="profile-sheet__confirm-btn"
        onClick={handleSave}
        disabled={!isEmailValid}
      >
        확인
      </Button>
    </div>
  );
}

export default EmailSheet;
