/**
 * App Header - Application header with branding and navigation
 * 
 * Displays the application title, subtitle, and any global navigation elements.
 * Designed to be responsive and accessible.
 * 
 * @example
 * ```tsx
 * <AppHeader 
 *   title="Saga3D" 
 *   subtitle="Tell your system's saga in 3D" 
 * />
 * ```
 */

import React from 'react';
import { cn } from '../../utils/classNames';
import './AppHeader.css';

export interface AppHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: React.ReactNode;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

export const AppHeader = React.memo<AppHeaderProps>(({
  title,
  subtitle,
  actions,
  className,
  'data-testid': testId
}) => {
  const headerClasses = cn(
    'app-header',
    className
  );

  return (
    <header className={headerClasses} data-testid={testId}>
      <div className="app-header__brand">
        <div className="app-header__logo">
          <svg 
            className="app-header__logo-icon" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-label="Saga3D Logo"
          >
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </div>
        
        <div className="app-header__text">
          <h1 className="app-header__title">
            {title}
          </h1>
          {subtitle && (
            <p className="app-header__subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="app-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
});

AppHeader.displayName = 'AppHeader';
