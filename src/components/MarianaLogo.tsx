import React from 'react';

interface MarianaLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header' | 'footer';
  className?: string;
  showGlow?: boolean;
  variant?: 'full' | 'compact';
}

const DEFAULT_OFFICIAL_LOGO = '/images/mariana_logo_oficial.jpg';

export const MarianaLogo: React.FC<MarianaLogoProps> = ({
  customLogoUrl,
  size = 'md',
  className = '',
  showGlow = true,
  variant = 'full',
}) => {
  const logoSrc = customLogoUrl || DEFAULT_OFFICIAL_LOGO;

  // In compact mode (e.g., small icon in scrolled navbar), show focused medallion icon
  if (variant === 'compact') {
    const compactSizeClasses = {
      sm: 'w-9 h-9',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
      header: 'w-14 h-14',
      footer: 'w-12 h-12',
    }[size];

    return (
      <div
        className={`relative rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-indigo-400 flex items-center justify-center shrink-0 ${compactSizeClasses} ${
          showGlow ? 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' : ''
        } ${className}`}
      >
        <img
          src={logoSrc}
          alt="Mariana Amorim - Monograma MA"
          className="w-full h-full object-cover object-center rounded-full select-none"
        />
      </div>
    );
  }

  // Full official artwork: preserves original proportion (1264x848) without cutting the circle, monogram MA, or "MARIANA AMORIM" text
  const fullSizeClasses = {
    sm: 'max-w-[120px] sm:max-w-[150px]',
    md: 'max-w-[180px] sm:max-w-[220px]',
    lg: 'max-w-[240px] sm:max-w-[290px]',
    xl: 'max-w-[300px] sm:max-w-[360px]',
    header: 'w-full max-w-[260px] xs:max-w-[290px] sm:max-w-[340px] md:max-w-[380px]',
    footer: 'w-full max-w-[200px] sm:max-w-[240px]',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${fullSizeClasses} ${className}`}
    >
      <img
        src={logoSrc}
        alt="Mariana Amorim - Identidade Oficial"
        className={`w-full h-auto object-contain rounded-2xl transition-all duration-300 ${
          showGlow ? 'drop-shadow-[0_4px_28px_rgba(168,85,247,0.4)]' : ''
        }`}
        loading="eager"
      />
    </div>
  );
};
