import { ReactNode, ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  children: ReactNode;
}

const variantClasses = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        rounded-lg font-medium transition-colors
        flex items-center gap-2 justify-center
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};
