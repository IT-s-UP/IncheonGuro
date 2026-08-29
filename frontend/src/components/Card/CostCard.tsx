import Typography from '@/components/Typography/Typography';
import './CostCard.css';

interface CostCardProps {
  title: string;
  subLabel: string;
  subValue: string;
  totalLabel: string;
  totalValue: string;
}

function CostCard({ title, subLabel, subValue, totalLabel, totalValue }: CostCardProps) {
  return (
    <div className="cost-card">
      <Typography variant="head3">{title}</Typography>
      <div className="cost-card__row">
        <Typography variant="p2">{subLabel}</Typography>
        <Typography variant="p2">{subValue}</Typography>
      </div>
      <div className="cost-card__row">
        <Typography variant="head3">{totalLabel}</Typography>
        <Typography variant="head3" className="cost-card__total-value">
          {totalValue}
        </Typography>
      </div>
    </div>
  );
}

export default CostCard;
