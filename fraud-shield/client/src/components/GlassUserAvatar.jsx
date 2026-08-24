import React from 'react';
import { Box } from '@mui/material';

const GlassUserAvatar = ({ size = 36, sx = {} }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 4px 10px rgba(56, 189, 248, 0.35))',
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
        '&:hover': { transform: 'scale(1.1)' },
        ...sx
      }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Glass Outer Ring Gradient */}
          <linearGradient id="glassRingGrad" x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.2" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>

          {/* Glass Ring Bevel & Highlight */}
          <linearGradient id="glassHighlight" x1="30" y1="10" x2="90" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          {/* User Head & Body 3D Gradient */}
          <linearGradient id="userBodyGrad" x1="45" y1="35" x2="75" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* User Top Gloss Highlight */}
          <linearGradient id="userGloss" x1="60" y1="35" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 3D Glass Outer Ring Base (Tilted Isometric Angle) */}
        <g transform="rotate(-15 60 60)">
          {/* Glass Back Wall Refraction */}
          <circle
            cx="60"
            cy="60"
            r="44"
            stroke="url(#glassRingGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Glass Inner Reflection Rim */}
          <circle
            cx="60"
            cy="60"
            r="36"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.6"
          />

          {/* Glass Outer Rim Reflection */}
          <circle
            cx="60"
            cy="60"
            r="51"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeOpacity="0.75"
          />

          {/* Specular Highlight Arcs on Ring */}
          <path
            d="M 28 35 A 44 44 0 0 1 75 18"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M 50 102 A 44 44 0 0 1 95 80"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Center 3D Glassmorphic User Figure */}
        {/* Soft Shadow below user */}
        <ellipse cx="60" cy="86" rx="20" ry="5" fill="#0284c7" opacity="0.25" />

        {/* 3D User Head Sphere */}
        <circle cx="60" cy="46" r="14" fill="url(#userBodyGrad)" filter="url(#glassGlow)" />
        <ellipse cx="58" cy="42" rx="7" ry="4" fill="url(#userGloss)" opacity="0.9" />

        {/* 3D User Torso / Shoulder */}
        <path
          d="M 38 80 C 38 67 48 64 60 64 C 72 64 82 67 82 80 C 82 85 78 88 60 88 C 42 88 38 85 38 80 Z"
          fill="url(#userBodyGrad)"
        />

        {/* Torso Top Highlight / Bevel */}
        <path
          d="M 44 74 C 48 68 54 66 60 66 C 66 66 72 68 76 74"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Torso Side Details */}
        <line x1="48" y1="77" x2="48" y2="83" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <line x1="72" y1="77" x2="72" y2="83" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    </Box>
  );
};

export default GlassUserAvatar;
