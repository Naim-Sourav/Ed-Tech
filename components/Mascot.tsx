import React from 'react';

interface MascotProps {
  size?: number;
  className?: string;
  mood?: 'happy' | 'thinking' | 'excited';
}

const Mascot: React.FC<MascotProps> = ({ size = 120, className = '', mood = 'happy' }) => {
  // This is a placeholder SVG for "Dhrubo" - a friendly robot/star character
  // You can replace the <svg> content with your own SVG code
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Body */}
        <rect x="60" y="80" width="80" height="70" rx="20" fill="#1565C0" />
        <rect x="60" y="80" width="80" height="70" rx="20" fill="url(#paint0_linear)" fillOpacity="0.5" />
        
        {/* Screen/Face */}
        <rect x="70" y="90" width="60" height="40" rx="10" fill="#E3F2FD" />
        
        {/* Eyes (Change based on mood) */}
        {mood === 'happy' && (
          <>
            <circle cx="90" cy="110" r="5" fill="#1E293B" />
            <circle cx="110" cy="110" r="5" fill="#1E293B" />
            {/* Smile */}
            <path d="M95 120 Q100 125 105 120" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        
        {mood === 'thinking' && (
          <>
            <circle cx="90" cy="110" r="5" fill="#1E293B" />
            <rect x="105" y="108" width="10" height="4" rx="2" fill="#1E293B" />
            <path d="M95 120 H105" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {mood === 'excited' && (
          <>
            <path d="M85 110 L90 105 L95 110" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M105 110 L110 105 L115 110" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M95 120 Q100 128 105 120" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Antenna */}
        <path d="M100 80 V60" stroke="#1565C0" strokeWidth="4" />
        <circle cx="100" cy="55" r="8" fill="#8b5cf6" className="animate-pulse" />
        
        {/* Arms */}
        <path d="M60 100 H45 C40 100 40 110 45 115" stroke="#1565C0" strokeWidth="8" strokeLinecap="round" />
        <path d="M140 100 H155 C160 100 160 90 155 85" stroke="#1565C0" strokeWidth="8" strokeLinecap="round" />

        {/* Gradients */}
        <defs>
          <linearGradient id="paint0_linear" x1="100" y1="80" x2="100" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.2"/>
            <stop offset="1" stopColor="black" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Mascot;
