import Typography from '@/components/Typography/Typography';
import './PasswordModal.css';

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '←'];

interface PasswordModalProps {
  open: boolean;
  title: string;
  length?: number;
  value: string;
  onInput: (digit: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}

function PasswordModal({
  open,
  title,
  length = 4,
  value,
  onInput,
  onBackspace,
  onClose,
}: PasswordModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="password-modal-backdrop" onClick={onClose}>
      <div className="password-modal" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="password-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M4 4l16 16M20 4L4 20"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <Typography variant="subtitle1" as="p" className="password-modal__title">
          {title}
        </Typography>

        <div className="password-modal__dots">
          {Array.from({ length }, (_, index) => (
            <span
              key={index}
              className={
                index < value.length
                  ? 'password-modal__dot password-modal__dot--filled'
                  : 'password-modal__dot'
              }
            />
          ))}
        </div>

        <div className="password-modal__keypad">
          {KEYPAD_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="password-modal__key"
              onClick={() => (key === '←' ? onBackspace() : onInput(key))}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PasswordModal;
