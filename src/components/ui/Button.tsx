import React from 'react';
import { Spinner } from './Spinner';
import { ButtonProps } from '../../types';
import { cn, createVariants } from '../../utils/classNames';
import './Button.css';

/**
 * A versatile button component with multiple variants and states
 * 
 * Supports all common button patterns with consistent styling,
 * loading states, and accessibility features.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * 
 * <Button variant="danger" isLoading>
 *   Deleting...
 * </Button>
 * ```
 */

const buttonVariants = createVariants({
  base: 'btn',
  variants: {
    variant: {
      primary: 'btn--primary',
      secondary: 'btn--secondary',
      danger: 'btn--danger',
      ghost: 'btn--ghost'
    },
    size: {
      sm: 'btn--sm',
      md: 'btn--md',
      lg: 'btn--lg'
    }
  }
});

export const Button = React.memo<ButtonProps>(({ 
  variant = 'primary',
  size = 'md', 
  isLoading = false,
  disabled = false,
  children, 
  onClick,
  'data-testid': testId,
  className,
  type = 'button'
}) => {
  const buttonClasses = cn(
    buttonVariants.base,
    buttonVariants.variants.variant[variant],
    buttonVariants.variants.size[size],
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      data-testid={testId}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <div className="btn__content">
          <Spinner size={size} />
          {children}
        </div>
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
