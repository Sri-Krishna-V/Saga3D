/**
 * Common utility types and error handling patterns
 */

// Result type for error handling - eliminates throwing exceptions
export type Result<T, E = Error> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Helper to create success result
export const success = <T>(data: T): Result<T, never> => ({ 
  success: true, 
  data 
});

// Helper to create error result
export const error = <E>(error: E): Result<never, E> => ({ 
  success: false, 
  error 
});

// Custom error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: readonly string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SaveError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'SaveError';
  }
}

export class LoadError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'LoadError';
  }
}

export class ExportError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ExportError';
  }
}

// Application error for global error handling
export interface AppError {
  readonly message: string;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly recoverable: boolean;
}

// Icon data structure
export interface IconData {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly svg: string;
  readonly tags?: readonly string[];
}

// Generic event handler types
export type EventHandler<T = void> = (data: T) => void;
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;

// Utility types
export type NonEmptyArray<T> = [T, ...T[]];
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Theme types
export interface Theme {
  readonly colors: {
    readonly primary: string;
    readonly secondary: string;
    readonly background: string;
    readonly surface: string;
    readonly error: string;
    readonly warning: string;
    readonly success: string;
    readonly text: {
      readonly primary: string;
      readonly secondary: string;
      readonly disabled: string;
    };
  };
  readonly spacing: {
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
  };
  readonly borderRadius: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
  };
  readonly shadows: {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
  };
}
