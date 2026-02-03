
import React from 'react';

const CosmicConnection: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#05020a]">
      {/* Dynamic Background with CSS Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#090412] to-black"></div>
      
      {/* Stars Container - Static */}
      <div className="absolute inset-0 opacity-80">
         {/* Small Stars */}
         <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
         <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200 rounded-full"></div>
         <div className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 bg-purple-200 rounded-full"></div>
         <div className="absolute top-10 right-10 w-1 h-1 bg-white rounded-full"></div>
         <div className="absolute bottom-20 right-20 w-0.5 h-0.5 bg-cyan-200 rounded-full"></div>
         <div className="absolute top-1/2 left-10 w-1 h-1 bg-yellow-100 rounded-full animate-pulse"></div>
         <div className="absolute bottom-10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
      </div>

      {/* SVG Cosmic Elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full max-w-[400px]" 
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <linearGradient id="planetGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            <linearGradient id="planetGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Connection Line Gradient */}
            <linearGradient id="lineGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#e879f9" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Connection Line */}
          <path 
            d="M100,200 Q200,240 300,200" 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="1" 
            strokeDasharray="4 4"
            className="animate-pulse"
          />

          {/* Left Celestial Body (You) */}
          <g filter="url(#glow)">
            <circle cx="100" cy="200" r="30" fill="url(#planetGradient1)" opacity="0.8" />
            <ellipse cx="100" cy="200" rx="45" ry="10" stroke="#f0abfc" strokeWidth="1" fill="none" transform="rotate(-15 100 200)" opacity="0.6" />
             <circle cx="80" cy="190" r="2" fill="white" opacity="0.9" />
          </g>

          {/* Right Celestial Body (Partner) */}
          <g filter="url(#glow)">
             <circle cx="300" cy="200" r="30" fill="url(#planetGradient2)" opacity="0.8" />
             <ellipse cx="300" cy="200" rx="45" ry="10" stroke="#67e8f9" strokeWidth="1" fill="none" transform="rotate(15 300 200)" opacity="0.6" />
             <circle cx="315" cy="190" r="2" fill="white" opacity="0.9" />
          </g>

          {/* Central Energy */}
          <circle cx="200" cy="220" r="4" fill="white" filter="url(#glow)" className="animate-pulse" opacity="0.8">
             <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
          </circle>

        </svg>
      </div>

      <div className="absolute bottom-8 w-full text-center">
        <p className="text-xs text-fuchsia-200/40 uppercase tracking-[0.5em] font-light">Soul Resonance</p>
      </div>
    </div>
  );
};

export default CosmicConnection;
