import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-emerald-50 text-emerald-900 border-emerald-200/80 font-medium',
    success: 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    teal: 'bg-teal-50 text-teal-900 border-teal-200',
    purple: 'bg-indigo-50 text-indigo-900 border-indigo-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-1.5 font-semibold',
  };

  const dots = {
    default: 'bg-slate-400',
    primary: 'bg-emerald-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    teal: 'bg-teal-600',
    purple: 'bg-indigo-600',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border shadow-2xs ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant] || dots.default}`} />}
      {children}
    </span>
  );
}
