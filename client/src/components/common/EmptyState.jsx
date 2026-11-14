import React from 'react';
import { Compass } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'Try adjusting your filters or expanding your search radius.',
  action = null
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-card border border-slate-border/80 shadow-sm my-4">
      <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center text-primary mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-navy mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

