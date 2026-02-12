import React from 'react';

export const CigarettePack: React.FC = () => {
  return (
    <div className="relative w-24 h-36 bg-white shadow-xl rotate-12 transform hover:rotate-0 transition-transform duration-500 cursor-pointer group">
      {/* Box shape */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-300 rounded-sm overflow-hidden">
        {/* Top Gold Band */}
        <div className="h-10 bg-yellow-600 flex items-center justify-center shadow-sm">
           <span className="text-white text-[10px] tracking-widest font-bold">FILTRE</span>
        </div>
        
        {/* Main Logo Area */}
        <div className="flex-1 flex flex-col items-center justify-center h-20 bg-black p-2 relative">
          <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center bg-black">
             <span className="text-yellow-500 font-serif font-bold text-xl tracking-tighter">MARS</span>
          </div>
          <span className="absolute bottom-1 text-[8px] text-white">INTERNATIONALE</span>
        </div>

        {/* Bottom */}
        <div className="h-6 bg-yellow-600"></div>
      </div>
      
      {/* Cigarettes sticking out (optional) */}
      <div className="absolute -top-2 left-4 w-3 h-6 bg-orange-200 border border-orange-300 rounded-t-sm -z-10 group-hover:-top-4 transition-all"></div>
      <div className="absolute -top-1 left-8 w-3 h-6 bg-orange-200 border border-orange-300 rounded-t-sm -z-10 group-hover:-top-3 transition-all"></div>
    </div>
  );
};
