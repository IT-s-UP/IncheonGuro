import Typography from '@/components/Typography/Typography';
import './RoundTab.css';

interface RoundTabProps {
  options: [string, string];
  activeIndex: 0 | 1;
  onChange: (index: 0 | 1) => void;
}

function RoundTab({ options, activeIndex, onChange }: RoundTabProps) {
  return (
    <div className="round-tab">
      <div
        className="round-tab__thumb"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {options.map((label, index) => (
        <button
          key={label}
          type="button"
          className="round-tab__option"
          onClick={() => onChange(index as 0 | 1)}
        >
          <Typography variant="p2" color={index === activeIndex ? '#000000' : '#56504b'}>
            {label}
          </Typography>
        </button>
      ))}
    </div>
  );
}

export default RoundTab;
