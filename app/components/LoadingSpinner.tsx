
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative w-16 h-16">
      {/* 外側の薄い円 */}
      <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full"></div>
      {/* 回転するアニメーション円 */}
      <div className="absolute inset-0 border-4 border-t-fuchsia-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-fuchsia-300 animate-pulse font-medium tracking-widest text-sm">
      星の欠片を集めています...
    </p>
  </div>
);

export default LoadingSpinner;
