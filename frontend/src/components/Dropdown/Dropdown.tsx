import { useState } from 'react';
import Typography from '@/components/Typography/Typography';
import './Dropdown.css';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

function Dropdown({ label, placeholder = '선택해주세요', value, options, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="dropdown">
      {label && (
        <Typography variant="subtitle2" as="p" className="dropdown__label">
          {label}
        </Typography>
      )}

      <button type="button" className="dropdown__trigger" onClick={() => setIsOpen((prev) => !prev)}>
        <Typography variant="subtitle2" color={selected ? '#000000' : '#626262'}>
          {selected ? selected.label : placeholder}
        </Typography>
        <svg
          className={isOpen ? 'dropdown__chevron dropdown__chevron--open' : 'dropdown__chevron'}
          viewBox="0 0 12 8"
          width="12"
          height="8"
          aria-hidden="true"
        >
          <path
            d="M1 1l5 5 5-5"
            fill="none"
            stroke="#626262"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="dropdown__list">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className="dropdown__option"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Typography variant="subtitle2">{option.label}</Typography>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
export type { DropdownOption };
