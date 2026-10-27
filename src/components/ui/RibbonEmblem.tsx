import React from "react";

interface RibbonEmblemProps {
  className?: string;
  size?: number;
}

export function RibbonEmblem({ className = "w-3.5 h-3.5", size }: RibbonEmblemProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Left Folded Ribbon Wing */}
      <path
        d="M10 9.8C7.4 6.5 4 7.2 4.4 10.2C4.8 12.8 8.4 11 10 9.8Z"
        fill="currentColor"
      />
      {/* Right Folded Ribbon Wing */}
      <path
        d="M10 9.8C12.6 6.5 16 7.2 15.6 10.2C15.2 12.8 11.6 11 10 9.8Z"
        fill="currentColor"
      />
      {/* Center Artisan Knot Pearl */}
      <circle cx="10" cy="9.8" r="2.2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10" cy="9.8" r="1.1" fill="currentColor" />
      {/* Flowing Satin Ribbon Tails */}
      <path
        d="M8.5 11.5C7.8 13.5 6.2 15.2 4.8 16.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.5 11.5C12.2 13.5 13.8 15.2 15.2 16.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default RibbonEmblem;
