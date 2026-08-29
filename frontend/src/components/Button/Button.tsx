import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Typography from '@/components/Typography/Typography';
import type { TypographyVariant } from '@/components/Typography/Typography';
import './Button.css';

type ButtonSize = 'main' | 'middle' | 'sub' | 'small';
type ButtonVariant = 'primary' | 'light';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  children: ReactNode;
}

const TEXT_VARIANT: Record<ButtonSize, TypographyVariant> = {
  main: 'subtitle1',
  middle: 'subtitle1',
  sub: 'p2',
  small: 'p2',
};

function Button({
  size = 'sub',
  variant = 'primary',
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classNames = ['button', `button--${size}`, `button--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} {...rest}>
      <Typography variant={TEXT_VARIANT[size]} color="inherit">
        {children}
      </Typography>
    </button>
  );
}

export default Button;
export type { ButtonSize, ButtonVariant };
