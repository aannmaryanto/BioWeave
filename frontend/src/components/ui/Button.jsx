import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-2xs';

  const variants = {
    primary: 'bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-900 shadow-xs active:bg-emerald-950',
    accent: 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-700 shadow-xs active:bg-teal-800',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 active:bg-slate-300',
    outline: 'bg-white hover:bg-emerald-50/50 text-emerald-900 border border-slate-200 hover:border-emerald-700/50 shadow-2xs',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200 shadow-none border-0',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-xs',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-4.5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : LeftIcon ? (
        <LeftIcon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4'}`} />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon && (
        <RightIcon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4.5 h-4.5' : 'w-4 h-4'}`} />
      )}
    </button>
  );
}
