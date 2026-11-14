import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MatchScoreBadge({ score }) {
  let colorStyle = 'bg-primary-light text-primary border-primary/30';
  if (score >= 85) {
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300';
  } else if (score >= 65) {
    colorStyle = 'bg-teal-light text-teal border-teal/30';
  } else if (score >= 45) {
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-300';
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${colorStyle}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score}% Match</span>
    </div>
  );
}

