import Button from '@/components/Button/Button';
import Typography from '@/components/Typography/Typography';
import './ResultModal.css';

interface ResultModalProps {
  open: boolean;
  variant: 'success' | 'fail';
  message: string;
  description?: string;
  buttonLabel: string;
  onClose: () => void;
}

function ResultModal({ open, variant, message, description, buttonLabel, onClose }: ResultModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="result-modal-backdrop" onClick={onClose}>
      <div className="result-modal" onClick={(event) => event.stopPropagation()}>
        <div className={`result-modal__icon result-modal__icon--${variant}`} aria-hidden="true">
          {variant === 'success' ? (
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path
                d="M4 12l6 6L20 6"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path
                d="M12 3l10 18H2L12 3z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line x1="12" y1="10" x2="12" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="#ffffff" />
            </svg>
          )}
        </div>

        <Typography variant="head3" as="p" className="result-modal__message">
          {message}
        </Typography>

        {description && (
          <Typography variant="caption1" as="p" color="#666666">
            {description}
          </Typography>
        )}

        <Button size="small" variant={variant === 'success' ? 'light' : 'primary'} onClick={onClose}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

export default ResultModal;
