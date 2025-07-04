/**
 * App Layout - Main application layout container
 * 
 * Provides the overall structure for the application with header,
 * toolbar, main content area, and responsive design considerations.
 * 
 * @example
 * ```tsx
 * <AppLayout>
 *   <DiagramCanvas />
 * </AppLayout>
 * ```
 */

import React from 'react';
import { AppHeader } from './AppHeader';
import { cn } from '../../utils/classNames';
import './AppLayout.css';

export interface AppLayoutProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly toolbar?: React.ReactNode;
  readonly 'data-testid'?: string;
}

export const AppLayout = React.memo<AppLayoutProps>(({
  children,
  className,
  toolbar,
  'data-testid': testId
}) => {
  const layoutClasses = cn(
    'app-layout',
    className
  );

  return (
    <div className={layoutClasses} data-testid={testId}>
      <AppHeader 
        title="Saga3D"
        subtitle="Tell your system's saga in 3D"
      />
      
      {toolbar && (
        <div className="app-toolbar">
          {toolbar}
        </div>
      )}
      
      <main className="app-main">
        {children}
      </main>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';
