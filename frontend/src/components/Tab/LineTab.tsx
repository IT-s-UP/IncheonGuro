import Typography from '@/components/Typography/Typography';
import './LineTab.css';

interface LineTabProps {
  items: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

function LineTab({ items, activeIndex, onChange }: LineTabProps) {
  return (
    <div className="line-tab">
      {items.map((label, index) => (
        <button
          key={label}
          type="button"
          className={
            index === activeIndex ? 'line-tab__item line-tab__item--active' : 'line-tab__item'
          }
          onClick={() => onChange(index)}
        >
          <Typography
            variant={index === activeIndex ? 'head2' : 'p1'}
            color={index === activeIndex ? '#000000' : '#6e6e6e'}
          >
            {label}
          </Typography>
        </button>
      ))}
    </div>
  );
}

export default LineTab;
