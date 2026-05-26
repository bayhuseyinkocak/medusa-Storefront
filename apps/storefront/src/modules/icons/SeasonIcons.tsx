"use client";

import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AllSeasonIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size }}
      className={className}
      {...props}
    >
      <path d="M12 7a5 5 0 0 0 0 10" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="1" y1="12" x2="3" y2="12" />
      
      <line x1="12" y1="12" x2="22" y2="12" />
      <line x1="12" y1="12" x2="19.07" y2="4.93" />
      <line x1="12" y1="12" x2="19.07" y2="19.07" />
      <polyline points="20 16 16 16 16 20" />
      <polyline points="16 4 16 8 20 8" />
    </svg>
  );
};

export const SummerSeasonIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size }}
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
};

export const WinterSeasonIcon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size }}
      className={className}
      {...props}
    >
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M20 16l-4-4 4-4" />
      <path d="M4 8l4 4-4 4" />
      <path d="M16 4l-4 4-4-4" />
      <path d="M8 20l4-4 4 4" />
    </svg>
  );
};

export interface SeasonIconProps extends IconProps {
  season: string;
}

export const SeasonIcon: React.FC<SeasonIconProps> = ({ season, ...props }) => {
  const sLower = season.toLowerCase().trim();
  if (sLower === "summer" || sLower === "sommer") {
    return <SummerSeasonIcon {...props} />;
  }
  if (sLower === "winter") {
    return <WinterSeasonIcon {...props} />;
  }
  if (sLower.includes("all") || sLower === "allwetter" || sLower === "all-season" || sLower === "allseason" || sLower === "4 saisons" || sLower === "4saisons") {
    return <AllSeasonIcon {...props} />;
  }
  return null;
};
