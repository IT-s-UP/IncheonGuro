import { Bookmark } from 'lucide-react';
import Typography from '@/components/Typography/Typography';
import './PlaceCard.css';

interface PlaceCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  bookmarked?: boolean;
  onClick?: () => void;
  onBookmarkClick?: () => void;
}

function PlaceCard({
  title,
  subtitle,
  imageUrl,
  bookmarked = false,
  onClick,
  onBookmarkClick,
}: PlaceCardProps) {
  const handleBookmarkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onBookmarkClick?.();
  };

  return (
    <div
      className="place-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <button
        type="button"
        className="place-card__bookmark-btn"
        onClick={handleBookmarkClick}
        aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
        aria-pressed={bookmarked}
      >
        <Bookmark
          className="place-card__bookmark-icon"
          size={20}
          fill={bookmarked ? '#000000' : 'none'}
          color="#000000"
        />
      </button>

      <div className="place-card__text">
        <Typography variant="head3">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle3" color="#666666">
            {subtitle}
          </Typography>
        )}
      </div>

      <div
        className="place-card__thumbnail"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />
    </div>
  );
}

export default PlaceCard;
