import Typography from '@/components/Typography/Typography';
import './SingleCard.css';

interface SingleCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  onClick?: () => void;
}

function SingleCard({ title, subtitle, imageUrl, onClick }: SingleCardProps) {
  return (
    <div
      className="single-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="single-card__text">
        <Typography variant="head3">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle3" color="#666666">
            {subtitle}
          </Typography>
        )}
      </div>
      <div
        className="single-card__thumbnail"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />
    </div>
  );
}

export default SingleCard;
