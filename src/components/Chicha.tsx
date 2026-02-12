import React from 'react';

export const Chicha: React.FC = () => {
  return (
    <div className="relative w-32 h-64 flex flex-col items-center justify-end pointer-events-none select-none">
      {/* Smoke */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-full h-40 flex justify-center">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="smoke-particle absolute bg-gray-300 rounded-full blur-xl"
            style={{
              width: 20 + Math.random() * 20,
              height: 20 + Math.random() * 20,
              animationDelay: `${i * 0.8}s`,
              left: `calc(50% + ${Math.random() * 20 - 10}px)`
            }}
          />
        ))}
      </div>

      {/* Top Bowl (Ras) */}
      <div className="w-10 h-8 bg-amber-800 rounded-t-lg shadow-inner z-10 border-b border-amber-900"></div>
      
      {/* Stem */}
      <div className="w-4 h-24 bg-gradient-to-b from-gray-300 to-gray-400 z-10 flex flex-col items-center justify-around border-x border-gray-500">
         <div className="w-6 h-2 bg-amber-700 rounded-full" />
         <div className="w-6 h-2 bg-amber-700 rounded-full" />
      </div>

      {/* Base (Vase) */}
      <div className="relative w-24 h-28 bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-sm rounded-b-3xl rounded-t-xl shadow-2xl overflow-hidden z-10 border border-white/20">
        <div className="absolute inset-0 bg-blue-500/10" />
        {/* Water bubbles animation could go here */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-10 bg-blue-400/20 blur-md rounded-full" />
      </div>
      
      {/* Hose (Tuyau) - stylized curve */}
      <svg className="absolute bottom-10 -right-20 w-32 h-32 pointer-events-none z-0" style={{ transform: 'rotate(-10deg)' }}>
        <path
          d="M 10 60 Q 40 60 40 30 T 80 80"
          fill="none"
          stroke="#5d4037"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 10 60 Q 40 60 40 30 T 80 80"
          fill="none"
          stroke="#3e2723"
          strokeWidth="6"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
