
import React from 'react';
import type { FortuneResult } from '../types';

interface ResultCardProps {
  result: FortuneResult;
  names: { name1: string; name2: string };
  dateStr: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, names, dateStr }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-fuchsia-300 mb-1">{names.name1} & {names.name2}</h2>
        <p className="text-fuchsia-200/50 text-xs tracking-widest">{dateStr} の運勢</p>
      </div>
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * result.score) / 100} className="text-fuchsia-500" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{result.score}%</span>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-fuchsia-100">{result.summary}</p>
      </div>
      <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <p>{result.advice}</p>
      </div>
    </div>
  );
};

export default ResultCard;
