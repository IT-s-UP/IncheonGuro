import { useState } from 'react';
import { Bookmark, CameraOff } from 'lucide-react';

import Typography from '@/components/Typography/Typography';

import './PlaceCard.css';

interface PlaceCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
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
  /*
   * 이미지 URL이 없거나
   * 이미지 로딩에 실패했는지 확인
   */
  const [imageError, setImageError] = useState(false);

  const handleBookmarkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onBookmarkClick?.();
  };

  const hasImage = !!imageUrl && imageUrl.trim() !== '' && !imageError;

  return (
    <div
      className="place-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* =========================
          북마크
      ========================= */}

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

      {/* =========================
          텍스트
      ========================= */}

      <div className="place-card__text">
        <Typography variant="head3">{title}</Typography>

        {subtitle && (
          <Typography variant="subtitle3" color="#666666">
            {subtitle}
          </Typography>
        )}
      </div>

      {/* =========================
          이미지
      ========================= */}

      <div className={`place-card__thumbnail ${!hasImage ? 'place-card__thumbnail--empty' : ''}`}>
        {hasImage ? (
          <img
            src={imageUrl}
            alt=""
            className="place-card__thumbnail-image"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="place-card__no-image">
            <CameraOff size={28} strokeWidth={1.5} />

            <span>이미지 없음</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceCard;
