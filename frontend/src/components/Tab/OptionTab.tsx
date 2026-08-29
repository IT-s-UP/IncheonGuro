import Typography from '@/components/Typography/Typography';
import type { TypographyVariant } from '@/components/Typography/Typography';
import './OptionTab.css';

type OptionTabSize = 'compact' | 'small' | 'large';

interface OptionTabProps {
  label: string;
  size?: OptionTabSize;
  active?: boolean;
  onClick?: () => void;
}

const TEXT_VARIANT: Record<OptionTabSize, TypographyVariant> = {
  compact: 'p3',
  small: 'p2',
  large: 'p2',
};

function OptionTab({ label, size = 'small', active = false, onClick }: OptionTabProps) {
  const classNames = ['option-tab', `option-tab--${size}`, active ? 'option-tab--active' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classNames} onClick={onClick}>
      <Typography variant={TEXT_VARIANT[size]}>{label}</Typography>
    </button>
  );
}

export default OptionTab;
export type { OptionTabSize };
