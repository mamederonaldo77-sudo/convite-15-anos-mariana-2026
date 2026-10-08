import React, { useMemo } from 'react';

interface SparklesBackgroundProps {
  accentColor?: string;
  secondaryColor?: string;
}

export const SparklesBackground: React.FC<SparklesBackgroundProps> = ({
  accentColor = '#c084fc',
  secondaryColor = '#e9d5ff',
}) => {
  // Generate stable random particles
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.8 + (i % 5) * 3) % 100}%`,
      top: `${(i * 3.7 + (i % 7) * 4) % 100}%`,
      size: (i % 3) + 2,
      duration: 4 + (i % 5) * 1.5,
      delay: (i % 6) * 0.8,
      opacity: 0.2 + (i % 5) * 0.15,
      color: i % 3 === 0 ? accentColor : i % 3 === 1 ? secondaryColor : '#f8fafc',
    }));
  }, [accentColor, secondaryColor]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient gradient meshes */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full blur-[140px] opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
        style={{ backgroundColor: secondaryColor }}
      />
      <div
        className="absolute top-2/3 -right-32 w-[600px] h-[600px] rounded-full blur-[130px] opacity-25"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute bottom-10 left-1/3 w-[500px] h-[400px] rounded-full blur-[120px] opacity-15"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Silver shimmer stars and sparkles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};
