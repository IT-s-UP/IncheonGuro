import Typography from '@/components/Typography/Typography';
import './CircleCard.css';

interface CircleCardProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  onClick?: () => void;
}

function CircleCard({ title, subtitle, avatarUrl, onClick }: CircleCardProps) {
  return (
    <div
      className="circle-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className="circle-card__avatar"
        style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
      />
      <div className="circle-card__text">
        <Typography variant="head3">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle3" color="#666666">
            {subtitle}
          </Typography>
        )}
      </div>
    </div>
  );
}

export default CircleCard;
