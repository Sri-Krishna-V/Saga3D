/**
 * Type definitions for React components and UI elements
 */

import { ReactNode } from 'react';

// Button component types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
  readonly children: ReactNode;
  readonly onClick: () => void;
  readonly 'data-testid'?: string;
  readonly className?: string;
  readonly type?: 'button' | 'submit' | 'reset';
}

// Dialog component types
export interface DialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly closeOnOverlayClick?: boolean;
  readonly showCloseButton?: boolean;
  readonly 'data-testid'?: string;
}

// Input component types
export interface InputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly type?: 'text' | 'email' | 'password' | 'number';
  readonly 'data-testid'?: string;
  readonly className?: string;
}

// Spinner component types
export interface SpinnerProps {
  readonly size?: ButtonSize;
  readonly color?: string;
  readonly 'data-testid'?: string;
  readonly className?: string;
}

// Layout component types
export interface LayoutProps {
  readonly children: ReactNode;
  readonly className?: string;
}

// Error boundary types
export interface ErrorFallbackProps {
  readonly error: Error | null;
  readonly errorInfo: { componentStack: string } | null;
  readonly onRetry: () => void;
}

// Loading skeleton types
export interface SkeletonProps {
  readonly width?: string | number;
  readonly height?: string | number;
  readonly borderRadius?: string;
  readonly className?: string;
}

// Tooltip types
export interface TooltipProps {
  readonly content: ReactNode;
  readonly children: ReactNode;
  readonly placement?: 'top' | 'bottom' | 'left' | 'right';
  readonly disabled?: boolean;
  readonly delay?: number;
}
