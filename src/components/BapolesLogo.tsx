import React from 'react';

interface BapolesLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'horizontal';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  customLogoUrl?: string;
}

export const BapolesLogo: React.FC<BapolesLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  theme = 'light',
  customLogoUrl,
}) => {
  const logoSource = customLogoUrl || '/images/bapoles_logo.svg';
  const emblemSource = '/images/bapoles_emblem.svg';

  // Size mapping
  const scale = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64 sm:w-80',
    xl: 'w-72 sm:w-96 md:w-[420px]',
  }[size];

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={logoSource}
          alt="BAPOLES Logo"
          className="w-11 h-11 object-contain drop-shadow-sm"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    const activeIcon = customLogoUrl && customLogoUrl !== '/images/bapoles_logo.svg' 
      ? customLogoUrl 
      : emblemSource;

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Emblem/Logo Image from uploaded official asset */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <img
            src={activeIcon}
            alt="Logo BAPOLES Dinas Kesehatan Provinsi NTT"
            className="h-12 sm:h-14 w-auto max-w-[60px] object-contain drop-shadow-xs transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Official Brand Typography */}
        <div className="flex flex-col text-left leading-none justify-center">
          <div className="inline-flex items-center">
            <span
              className={`text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-wider py-0.5 px-2 rounded-full inline-block ${
                theme === 'dark'
                  ? 'text-teal-300 bg-teal-950/70 border border-teal-800/60'
                  : 'text-white bg-[#10355c]'
              }`}
            >
              DINAS KESEHATAN PROVINSI NTT
            </span>
          </div>
          <span
            className={`text-xl sm:text-2xl font-black tracking-tight font-sans mt-0.5 sm:mt-1 ${
              theme === 'dark' ? 'text-white drop-shadow-sm' : 'text-[#10355c]'
            }`}
          >
            BAPOLES
          </span>
          {showSubtitle && (
            <span
              className={`text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase mt-0.5 ${
                theme === 'dark' ? 'text-teal-200' : 'text-[#10355c]/85'
              }`}
            >
              BA' OMONG POLA HIDUP SEHAT
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Hero Emblem (Matching exact uploaded image with high fidelity)
  return (
    <div className={`relative inline-flex flex-col items-center select-none ${scale} ${className}`}>
      {/* Decorative ambient backlight */}
      <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-cyan-400/20 to-blue-600/20 rounded-full blur-2xl pointer-events-none opacity-80" />

      {/* SVG Container */}
      <svg
        viewBox="0 0 460 420"
        className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="white-stroke" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          </filter>
          <linearGradient id="micBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e4976" />
            <stop offset="100%" stopColor="#0d2642" />
          </linearGradient>
          <linearGradient id="komodoTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38b2ac" />
            <stop offset="100%" stopColor="#1f857b" />
          </linearGradient>
        </defs>

        {/* Outer White Contour Glow for the Entire Upper Icon */}
        <g filter="url(#white-stroke)">
          {/* Main Microphone Capsule Base Outline */}
          <path
            d="M 160 70 
               C 160 40, 210 40, 210 70 
               L 210 185 
               C 210 205, 160 205, 160 185 
               Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="18"
            strokeLinejoin="round"
          />

          {/* Komodo dragon head outline on right */}
          <path
            d="M 205 60
               C 225 45, 275 50, 305 75
               C 320 88, 330 108, 320 125
               C 310 135, 290 135, 275 145
               C 255 158, 245 180, 210 195"
            fill="none"
            stroke="#ffffff"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pulse arrow outline */}
          <path
            d="M 130 200 L 190 200 L 210 160 L 235 220 L 260 140 L 285 185 L 315 150 L 335 150"
            fill="none"
            stroke="#ffffff"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arrowhead outline */}
          <polygon
            points="345,138 318,145 328,162"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="12"
            strokeLinejoin="round"
          />

          {/* Stand cradle outline */}
          <path
            d="M 145 150
               C 145 220, 245 220, 245 150"
            fill="none"
            stroke="#ffffff"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <line x1="195" y1="210" x2="195" y2="255" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
        </g>

        {/* Inner Colorful Fills */}
        {/* 1. Left Microphone Body */}
        <rect x="160" y="70" width="50" height="115" rx="25" fill="url(#micBlue)" />
        {/* Mic horizontal grille lines */}
        <line x1="170" y1="95" x2="200" y2="95" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        <line x1="170" y1="115" x2="200" y2="115" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        <line x1="170" y1="135" x2="200" y2="135" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        <line x1="170" y1="155" x2="200" y2="155" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

        {/* 2. Provincial Shield (Dinas Kesehatan Prov NTT) in Upper Mic */}
        <g transform="translate(172, 72) scale(0.65)">
          <path
            d="M 5 0 L 35 0 L 35 22 C 35 34 20 42 20 42 C 20 42 5 34 5 22 Z"
            fill="#b91c1c"
            stroke="#fbbf24"
            strokeWidth="3"
          />
          {/* Star and Rice/Wheat */}
          <polygon points="20,8 22,14 28,14 23,18 25,24 20,20 15,24 17,18 12,14 18,14" fill="#fbbf24" />
          <path d="M 12 28 Q 20 35 28 28" stroke="#fbbf24" strokeWidth="2" fill="none" />
        </g>

        {/* 3. Komodo Dragon Silhouette (Teal) */}
        <path
          d="M 205 60
             C 225 45, 275 50, 305 75
             C 320 88, 330 108, 320 125
             C 310 135, 290 135, 275 145
             C 255 158, 245 180, 210 195
             Z"
          fill="url(#komodoTeal)"
        />
        {/* Komodo Eye */}
        <circle cx="282" cy="85" r="4.5" fill="#ffffff" />
        <circle cx="283" cy="85" r="2.5" fill="#0f2b48" />
        {/* Komodo Nostril & Mouth line */}
        <ellipse cx="304" cy="98" rx="2.5" ry="4" fill="#0f2b48" />
        <path d="M 312 110 C 298 114 285 106 270 114" stroke="#0f2b48" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Medical Cross Symbol inside Komodo (+) */}
        <g transform="translate(245, 95)">
          <rect x="10" y="0" width="12" height="34" rx="3" fill="#ffffff" />
          <rect x="0" y="11" width="32" height="12" rx="3" fill="#ffffff" />
        </g>

        {/* 4. Stand Cradle (Navy with White Outline) */}
        <path
          d="M 152 145
             C 152 212, 238 212, 238 145"
          fill="none"
          stroke="#0f2b48"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line x1="195" y1="210" x2="195" y2="255" stroke="#0f2b48" strokeWidth="10" strokeLinecap="round" />

        {/* 5. Vibrant Cardiogram Pulse Arrow (Teal with white edge) */}
        <path
          d="M 130 200 L 190 200 L 210 160 L 235 220 L 260 140 L 285 185 L 315 150 L 335 150"
          fill="none"
          stroke="#38b2ac"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrowhead */}
        <polygon
          points="345,138 318,145 328,162"
          fill="#38b2ac"
        />

        {/* 6. Pill Banner: DINAS KESEHATAN PROVINSI NTT */}
        <g transform="translate(125, 246)">
          <rect x="0" y="0" width="210" height="30" rx="15" fill="#0f2b48" stroke="#ffffff" strokeWidth="4" />
          <text
            x="105"
            y="20"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="800"
            letterSpacing="1.2"
            fontFamily="system-ui, sans-serif"
          >
            DINAS KESEHATAN PROVINSI NTT
          </text>
        </g>

        {/* 7. Large Main Brand: BAPOLES */}
        <g transform="translate(40, 285)">
          {/* White backer box for ultra-clear contrast against any background */}
          <rect
            x="30"
            y="0"
            width="320"
            height="72"
            rx="16"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="8"
          />
          <text
            x="190"
            y="54"
            textAnchor="middle"
            fill="#0f2b48"
            fontSize="60"
            fontWeight="900"
            letterSpacing="2.5"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            BAPOLES
          </text>
        </g>

        {/* 8. Subtitle: BA' OMONG POLA HIDUP SEHAT */}
        {showSubtitle && (
          <g transform="translate(60, 362)">
            <rect
              x="20"
              y="0"
              width="300"
              height="36"
              rx="18"
              fill="#ffffff"
              stroke="#0f2b48"
              strokeWidth="2"
            />
            <text
              x="170"
              y="24"
              textAnchor="middle"
              fill="#0f2b48"
              fontSize="14.5"
              fontWeight="800"
              letterSpacing="1.5"
              fontFamily="system-ui, sans-serif"
            >
              BA' OMONG POLA HIDUP SEHAT
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
