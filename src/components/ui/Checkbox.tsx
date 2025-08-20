import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  variant?: 'default' | 'modern' | 'card';
  size?: 'sm' | 'md' | 'lg';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    description, 
    error, 
    className, 
    id, 
    variant = 'modern', 
    size = 'md',
    ...props 
  }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    };

    const variantClasses = {
      default: 'text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
      modern: 'text-teal-600 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 border-2 border-gray-300 rounded-md transition-all duration-200',
      card: 'sr-only', // Hidden for card-style checkboxes
    };

    if (variant === 'card') {
      return (
        <div className="w-full">
          <label
            htmlFor={inputId}
            className={clsx(
              'relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200',
              props.checked 
                ? 'border-teal-500 bg-teal-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
              className
            )}
          >
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className="sr-only"
              {...props}
            />
            <div className={clsx(
              'flex items-center justify-center rounded-lg transition-all duration-200',
              sizeClasses[size],
              props.checked 
                ? 'bg-teal-600 text-white' 
                : 'bg-white border-2 border-gray-300'
            )}>
              {props.checked && <Check className="h-3 w-3" />}
            </div>
            <div className="ml-3 flex-1">
              {label && (
                <span className={clsx(
                  'font-medium text-gray-900',
                  labelSizeClasses[size]
                )}>
                  {label}
                </span>
              )}
              {description && (
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>
          </label>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-start space-x-3">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={clsx(
              'appearance-none cursor-pointer',
              variantClasses[variant],
              sizeClasses[size],
              {
                'border-red-500 focus:ring-red-500': error,
              },
              className
            )}
            {...props}
          />
          {props.checked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          {label && (
            <label
              htmlFor={inputId}
              className={clsx(
                'font-medium text-gray-900 cursor-pointer',
                labelSizeClasses[size]
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
