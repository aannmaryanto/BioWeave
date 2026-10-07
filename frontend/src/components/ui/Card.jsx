import React from 'react';

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'normal',
  bordered = true,
  onClick,
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    tight: 'p-3 sm:p-4',
    normal: 'p-4 sm:p-5',
    large: 'p-5 sm:p-6',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl ${bordered ? 'border border-slate-200/80 shadow-2xs' : ''} ${
        hoverable ? 'transition-all duration-200 hover:shadow-sm hover:border-emerald-700/40 cursor-pointer' : ''
      } ${paddingStyles[padding] || paddingStyles.normal} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '', subtitle = '' }) {
  return (
    <div>
      <h3 className={`text-sm font-bold text-slate-900 tracking-tight ${className}`}>{children}</h3>
      {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 font-normal">{subtitle}</p>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`pt-3 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 ${className}`}>{children}</div>;
}
