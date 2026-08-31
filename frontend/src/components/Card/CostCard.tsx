import Typography from '@/components/Typography/Typography';
import './CostCard.css';

interface CostItem {
  label: string;
  value: string;
}

interface CostCardProps {
  title: string;
  items: CostItem[];
  totalLabel: string;
  totalValue: string;
}

function CostCard({ title, items, totalLabel, totalValue }: CostCardProps) {
  return (
    <div className="cost-card">
      {/* 제목 */}
      <Typography variant="head3">{title}</Typography>

      {/* 비용 상세 */}
      <div className="cost-card__items">
        {items.map((item) => (
          <div key={item.label} className="cost-card__row">
            <Typography variant="p2">{item.label}</Typography>

            <Typography variant="p2" className="cost-card__value">
              {item.value}
            </Typography>
          </div>
        ))}
      </div>

      {/* 총 예상 비용 */}
      <div className="cost-card__total">
        <Typography variant="head3">{totalLabel}</Typography>

        <Typography variant="head3" className="cost-card__total-value">
          {totalValue}
        </Typography>
      </div>
    </div>
  );
}

export default CostCard;
export type { CostItem };
