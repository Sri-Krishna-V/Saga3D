import React from 'react';
import { InputProps } from '../../types';
import { cn } from '../../utils/classNames';

/**
 * A text input component with validation and styling
 * 
 * Provides consistent form input styling with error states,
 * labels, and accessibility features.
 * 
 * @example
 * ```tsx
 * <Input 
 *   value={name}
 *   onChange={setName}
 *   label="Diagram Name"
 *   placeholder="Enter diagram name"
 *   required
 * />
 * 
 * <Input 
 *   value={email}
 *   onChange={setEmail}
 *   type="email"
 *   error="Invalid email format"
 * />
 * ```
 */
export const Input = React.memo<InputProps>(({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  label,
  required = false,
  type = 'text',
  'data-testid': testId,
  className
}) => {
  const inputId = React.useId();
  const errorId = React.useId();

  const inputClasses = cn(
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:bg-gray-50',
    {
      'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !error,
      'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50': error,
    },
    className
  );

  const labelClasses = cn(
    'block',
    'text-sm',
    'font-medium',
    'mb-1',
    {
      'text-gray-700': !error,
      'text-red-700': error,
    }
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        data-testid={testId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
