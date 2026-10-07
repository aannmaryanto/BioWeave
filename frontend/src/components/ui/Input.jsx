import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  rightElement,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-white text-slate-900 text-sm rounded-lg border transition-colors duration-150 py-2.5 ${
            Icon ? 'pl-9' : 'pl-3.5'
          } ${rightElement ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20'
          } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed outline-none shadow-xs ${className}`}
          {...props}
        />
        {rightElement && <div className="absolute right-3 flex items-center">{rightElement}</div>}
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full bg-white text-slate-900 text-sm rounded-lg border transition-colors duration-150 px-3.5 py-2.5 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20'
        } outline-none shadow-xs cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  id,
  rows = 4,
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-white text-slate-900 text-sm rounded-lg border transition-colors duration-150 p-3.5 ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20'
        } outline-none shadow-xs ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
