import type { InputHTMLAttributes } from 'react';
import './Input.css';

type InputSize = 'main' | 'middle' | 'small' | 'mini';
type InputVariant = 'box' | 'line';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
}

function Input({ variant = 'box', size = 'main', className, ...rest }: InputProps) {
  const sizeClass = variant === 'box' ? `input--${size}` : '';
  const classNames = ['input', `input--${variant}`, sizeClass, className].filter(Boolean).join(' ');

  return <input type="text" className={classNames} {...rest} />;
}

export default Input;
export type { InputSize, InputVariant };
