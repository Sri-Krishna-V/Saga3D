import React from 'react';
import { SpinnerProps } from '../../types';
import { cn } from '../../utils/classNames';
import './Spinner.css';

/**
 * A loading spinner component with size variants
 * 
 * Provides visual feedback for loading states with consistent sizing
 * that matches the design system.
 * 
 * @example
 * ```tsx
 * <Spinner size="md" />
 * 
 * <Button isLoading>
 *   <Spinner size="sm" className="mr-2" />
 *   Loading...
 * </Button>
 * ```
 */
export const Spinner = React.memo<SpinnerProps>(({
  size = 'md',
  color = 'currentColor',
  'data-testid': testId,
  className
}) => {
  const sizeClasses = {
    sm: 'spinner--sm',
    md: 'spinner--md',
    lg: 'spinner--lg'
  };

  const spinnerClasses = cn(
    'spinner',
    sizeClasses[size],
    className
  );

  return (
    <svg 
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      data-testid={testId}
      role="status"
      aria-label="Loading"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={color}
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

Spinner.displayName = 'Spinner';
