"use client";

import React from "react";

interface AnimatedSquiggleProps {
  className?: string;
}

export function AnimatedSquiggle({ className = "" }: AnimatedSquiggleProps) {
  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 225 1600 345"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[880px] h-auto drop-shadow-[0_6px_12px_rgba(0,0,0,0.12)]"
      >
        <defs>
          <linearGradient id="squiggleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01a0e9" />
            <stop offset="18%" stopColor="#00b8a5" />
            <stop offset="35%" stopColor="#51bf43" />
            <stop offset="50%" stopColor="#92c830" />
            <stop offset="65%" stopColor="#f4b914" />
            <stop offset="82%" stopColor="#f37d1d" />
            <stop offset="100%" stopColor="#ee4b24" />
          </linearGradient>
        </defs>
        <path
          className="squiggle-path"
          d="M 45,462 C 125,387 205,306 282,258 C 300,246 280,276 258,312 C 225,366 195,444 182,492 C 176,513 205,504 255,468 C 335,411 440,345 520,301 C 542,289 518,327 498,375 C 475,432 462,501 458,529 C 455,549 488,537 535,504 C 600,456 670,357 712,313 C 728,297 742,309 750,345 C 760,402 752,489 788,489 C 820,489 850,433 940,433 C 990,433 982,471 1015,471 C 1065,471 1125,371 1265,371 C 1400,371 1485,479 1558,479"
          fill="none"
          stroke="url(#squiggleGradient)"
          strokeWidth="38"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style>{`
        .squiggle-path {
          stroke-dasharray: 2655;
          stroke-dashoffset: 2655;
          animation: drawAndEraseLeft 5.6s ease-in-out infinite;
        }
        @keyframes drawAndEraseLeft {
          0% {
            stroke-dashoffset: 2655px;
          }
          45% {
            stroke-dashoffset: 0;
          }
          55% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -2655px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .squiggle-path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
