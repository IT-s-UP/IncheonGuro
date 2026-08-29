import Typography from '@/components/Typography/Typography';
import './DoubleCard.css';

interface DoubleCardProps {
  caption?: string;
  leftValue: string;
  rightValue: string;
}

function DoubleCard({ caption, leftValue, rightValue }: DoubleCardProps) {
  return (
    <div className="double-card">
      <div className="double-card__left">
        {caption && <Typography variant="caption2">{caption}</Typography>}
        <Typography variant="head3">{leftValue}</Typography>
      </div>
      <Typography variant="head3" className="double-card__right">
        {rightValue}
      </Typography>
    </div>
  );
}

export default DoubleCard;
