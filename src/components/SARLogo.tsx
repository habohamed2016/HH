import React from 'react';

export const SARLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white border border-slate-300 rounded-[22px] px-6 py-4 shadow-2xs flex items-center gap-6 select-none shrink-0 ${className}`}
      dir="ltr"
    >
      {/* Precision Vector SAR Wordmark matching official PDF brand lockup */}
      <div className="flex items-center justify-center">
        <svg
          className="h-12 w-auto"
          viewBox="0 0 220 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* S - Clean, wide geometric curve in corporate dark charcoal */}
          <path
            d="M 52 14.5 L 43 14.5 C 41 10.5 35 7.5 27 7.5 C 18 7.5 10.5 12 10.5 18.5 C 10.5 25 16.5 28 29.5 31 C 44 34 51.5 39 51.5 48 C 51.5 57 42 62 28 62 C 13.5 62 5 56 2.5 47.5 L 11.5 47.5 C 13.5 53 20 55.5 28 55.5 C 36 55.5 42.5 52 42.5 47.5 C 42.5 42 36.5 39 23.5 36 C 9 32.5 2 28 2 18.5 C 2 10 11.5 2 27 2 C 40 2 49.5 7 52 14.5 Z"
            fill="#282D33"
          />

          {/* A - Left Diagonal Stroke in Teal/Cyan (#00758A) */}
          <path
            d="M 68 62 L 91 2 L 102 2 L 79 62 Z"
            fill="#00758A"
          />

          {/* A - Right Diagonal Stroke in Corporate Charcoal (#282D33) */}
          <path
            d="M 101 2 L 112 2 L 135 62 L 124 62 Z"
            fill="#282D33"
          />

          {/* R - Corporate Charcoal (#282D33) */}
          <path
            d="M 152 2 L 183 2 C 198 2 208 10 208 22 C 208 31 201 37 189 40 L 210 62 L 197 62 L 178 41.5 L 163.5 41.5 L 163.5 62 L 152 62 Z M 163.5 10.5 L 163.5 33 L 182 33 C 190.5 33 196.5 28.5 196.5 22 C 196.5 15.5 190.5 10.5 182 10.5 Z"
            fill="#282D33"
          />
        </svg>
      </div>

      {/* Vertical Teal Divider */}
      <div className="h-14 w-[2px] bg-[#00758A]"></div>

      {/* Arabic Official Title & English Subtitle */}
      <div className="flex flex-col justify-center text-right" dir="rtl">
        <span className="text-[13.5px] font-black text-[#282D33] leading-[1.2] tracking-tight">الخطوط</span>
        <span className="text-[13.5px] font-black text-[#282D33] leading-[1.2] tracking-tight">الحديدية</span>
        <span className="text-[13.5px] font-black text-[#282D33] leading-[1.2] tracking-tight">السعودية</span>
        <div className="flex flex-col text-[7.5px] font-extrabold text-[#00758A] uppercase tracking-[0.08em] leading-[1.2] mt-1.5 font-mono text-right" dir="ltr">
          <span>SAUDI</span>
          <span>ARABIA</span>
          <span>RAILWAYS</span>
        </div>
      </div>
    </div>
  );
};
