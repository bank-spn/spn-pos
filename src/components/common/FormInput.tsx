import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = ({ label, error, className = '', ...props }: FormInputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          dark:bg-gray-700 dark:border-gray-600
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface FormTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  rows?: number;
}

export const FormTextarea = ({ label, error, rows = 3, className = '', ...props }: FormTextareaProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          dark:bg-gray-700 dark:border-gray-600
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const FormSelect = ({ label, error, options, className = '', ...props }: FormSelectProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
          dark:bg-gray-700 dark:border-gray-600
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
