import type { ElementType, ReactNode } from 'react';
import './Typography.css';

type TypographyVariant =
  | 'head1'
  | 'head2'
  | 'head3'
  | 'subtitle1'
  | 'subtitle2'
  | 'subtitle3'
  | 'p0'
  | 'p1'
  | 'p2'
  | 'p3'
  | 'caption1'
  | 'caption2';

interface TypographyProps {
  variant: TypographyVariant;
  as?: ElementType;
  color?: string;
  className?: string;
  children: ReactNode;
}

function Typography({
  variant,
  as: Component = 'span',
  color,
  className,
  children,
}: TypographyProps) {
  const classNames = ['typography', `typography--${variant}`, className].filter(Boolean).join(' ');

  return (
    <Component className={classNames} style={color ? { color } : undefined}>
      {children}
    </Component>
  );
}

export default Typography;
export type { TypographyVariant };
