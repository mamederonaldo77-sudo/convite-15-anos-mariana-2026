import React from 'react';

interface OrnamentalDividerProps {
  className?: string;
}

export const OrnamentalDivider: React.FC<OrnamentalDividerProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-md mx-auto my-3 text-purple-300 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Left fine line */}
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-300/60 to-purple-300 shadow-[0_0_6px_rgba(216,180,254,0.5)]" />

      {/* Central delicate lotus ornament icon matching reference photo */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          viewBox="0 0 40 24"
          className="w-8 h-5 sm:w-9 sm:h-6 text-purple-300 fill-current drop-shadow-[0_0_8px_rgba(192,132,252,0.85)] filter"
        >
          {/* Central tall petal */}
          <path
            d="M 20 2 C 18.5 7 17.5 14 20 20 C 22.5 14 21.5 7 20 2 Z"
            fill="currentColor"
          />

          {/* Left inner petal */}
          <path
            d="M 20 20 C 15 17 10 11 12 7 C 15 9.5 17.5 14 20 20 Z"
            fill="currentColor"
            opacity="0.95"
          />

          {/* Right inner petal */}
          <path
            d="M 20 20 C 25 17 30 11 28 7 C 25 9.5 22.5 14 20 20 Z"
            fill="currentColor"
            opacity="0.95"
          />

          {/* Left outer wing petal */}
          <path
            d="M 20 20 C 13.5 19 6 15 7.5 11.5 C 10 13 15 16.5 20 20 Z"
            fill="currentColor"
            opacity="0.8"
          />

          {/* Right outer wing petal */}
          <path
            d="M 20 20 C 26.5 19 34 15 32.5 11.5 C 30 13 25 16.5 20 20 Z"
            fill="currentColor"
            opacity="0.8"
          />

          {/* Small base jewel / droplet */}
          <ellipse cx="20" cy="21.5" rx="3.5" ry="1.2" fill="currentColor" opacity="0.9" />
          <circle cx="20" cy="2.5" r="0.8" fill="#ffffff" />
        </svg>
      </div>

      {/* Right fine line */}
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-purple-300/60 to-purple-300 shadow-[0_0_6px_rgba(216,180,254,0.5)]" />
    </div>
  );
};
