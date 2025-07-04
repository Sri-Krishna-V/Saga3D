import React, { useState } from 'react';
import { cn } from '../../utils/classNames';

export interface TooltipProps {
  readonly content: string;
  readonly children: React.ReactNode;
  readonly position?: 'top' | 'bottom' | 'left' | 'right';
  readonly delay?: number;
  readonly disabled?: boolean;
  readonly 'data-testid'?: string;
}

/**
 * A tooltip component that displays additional information on hover
 * 
 * Provides contextual help text with positioning options and
 * keyboard accessibility support.
 * 
 * @example
 * ```tsx
 * <Tooltip content="Save your current diagram">
 *   <Button variant="primary">Save</Button>
 * </Tooltip>
 * 
 * <Tooltip content="This field is required" position="bottom">
 *   <Input label="Name" required />
 * </Tooltip>
 * ```
 */
export const Tooltip = React.memo<TooltipProps>(({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
  'data-testid': testId
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const tooltipClasses = cn(
    'absolute',
    'z-50',
    'px-2',
    'py-1',
    'text-sm',
    'bg-gray-900',
    'text-white',
    'rounded',
    'shadow-lg',
    'whitespace-nowrap',
    'transition-opacity',
    'duration-200',
    'pointer-events-none',
    {
      'opacity-100': isVisible,
      'opacity-0': !isVisible,
      'bottom-full mb-2 left-1/2 transform -translate-x-1/2': position === 'top',
      'top-full mt-2 left-1/2 transform -translate-x-1/2': position === 'bottom',
      'right-full mr-2 top-1/2 transform -translate-y-1/2': position === 'left',
      'left-full ml-2 top-1/2 transform -translate-y-1/2': position === 'right',
    }
  );

  const arrowClasses = cn(
    'absolute',
    'w-2',
    'h-2',
    'bg-gray-900',
    'transform',
    'rotate-45',
    {
      'top-full left-1/2 -translate-x-1/2 -mt-1': position === 'top',
      'bottom-full left-1/2 -translate-x-1/2 -mb-1': position === 'bottom',
      'top-1/2 left-full -translate-y-1/2 -ml-1': position === 'left',
      'top-1/2 right-full -translate-y-1/2 -mr-1': position === 'right',
    }
  );

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      data-testid={testId}
    >
      {children}
      
      {content && (
        <div className={tooltipClasses} role="tooltip" aria-hidden={!isVisible}>
          {content}
          <div className={arrowClasses} />
        </div>
      )}
    </div>
  );
});

Tooltip.displayName = 'Tooltip';
