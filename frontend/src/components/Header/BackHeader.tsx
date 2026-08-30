import Typography from '@/components/Typography/Typography';
import './BackHeader.css';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

function BackHeader({ title, onBack }: BackHeaderProps) {
  return (
    <div className="back-header">
      <button
        type="button"
        className="back-header__back-btn"
        onClick={onBack}
        aria-label="뒤로 가기"
      >
        <span className="back-header__vector" aria-hidden="true" />
      </button>
      <Typography as="h2" variant="head2" className="back-header__title">
        {title}
      </Typography>
    </div>
  );
}

export default BackHeader;
