import React from 'react';

export default function Badge({ children, variant = 'primary', className = '' }) {
  const variantStyles = {
    primary: 'bg-primary-light text-primary border-primary/20',
    navy: 'bg-navy/10 text-navy border-navy/20',
    teal: 'bg-teal-light text-teal border-teal/20',
    orange: 'bg-orange-light text-orange-accent border-orange-accent/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant] || variantStyles.primary} ${className}`}>
      {children}
    </span>
  );
}

