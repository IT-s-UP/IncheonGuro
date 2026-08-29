import Typography from '@/components/Typography/Typography';
import './SquareTab.css';

interface SquareTabProps {
  items: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

function SquareTab({ items, activeIndex, onChange }: SquareTabProps) {
  return (
    <div className="square-tab">
      {items.map((label, index) => (
        <button
          key={label}
          type="button"
          className={
            index === activeIndex ? 'square-tab__item square-tab__item--active' : 'square-tab__item'
          }
          onClick={() => onChange(index)}
        >
          <Typography variant="p1" color={index === activeIndex ? '#ffffff' : '#000000'}>
            {label}
          </Typography>
        </button>
      ))}
    </div>
  );
}

export default SquareTab;
