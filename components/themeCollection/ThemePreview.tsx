import React, { useState } from 'react';
import { ThemeCollectionItem } from '../../features/themeCollection/themeTypes';
import { getThemeLevelLabel } from '../../features/themeCollection/themeCopy';

interface ThemePreviewProps {
  theme: ThemeCollectionItem;
  locked?: boolean;
  compact?: boolean;
  lang?: 'pt' | 'en';
}

const silhouettePath = (family: ThemeCollectionItem['instrumentFamily']) => {
  if (family === 'bass4' || family === 'bass5') {
    return 'M42 112 C78 88 113 82 154 86 L230 96 C258 100 276 85 292 55 C302 87 294 119 269 139 C248 156 217 154 177 143 L119 128 C87 120 62 126 42 146 Z';
  }
  if (family === 'guitar7' || family === 'guitar8') {
    return 'M42 118 C79 82 118 69 165 76 L247 87 L292 48 L282 112 L236 137 L158 126 C108 119 74 128 42 151 Z';
  }
  if (family === 'special') {
    return 'M44 112 C79 84 115 74 158 80 L224 85 C250 88 270 69 289 42 C300 76 292 109 267 132 C249 149 220 151 187 139 L139 124 C101 113 72 122 44 146 Z';
  }
  return 'M52 102 C86 77 117 71 160 75 L235 81 C255 83 270 70 284 47 C294 73 289 100 270 119 C255 134 234 139 204 134 L141 123 C102 116 76 120 52 138 Z';
};

const tunerPoints = (family: ThemeCollectionItem['instrumentFamily']) => {
  if (family === 'bass4') return [[88, 108], [126, 101], [228, 105], [260, 93]];
  if (family === 'bass5') return [[82, 110], [112, 102], [142, 98], [230, 106], [262, 94]];
  if (family === 'guitar7' || family === 'guitar8') return [[82, 116], [112, 101], [143, 94], [215, 100], [240, 94], [264, 80]];
  if (family === 'special') return [[84, 108], [116, 98], [149, 95], [218, 101], [245, 91], [270, 74]];
  return [[82, 104], [112, 104], [142, 104], [220, 113], [246, 119], [270, 108]];
};

const familyLabel = (family: ThemeCollectionItem['instrumentFamily'], lang: 'pt' | 'en') => {
  const labels: Record<ThemeCollectionItem['instrumentFamily'], Record<'pt' | 'en', string>> = {
    guitar6: { pt: 'guitarra 6', en: 'guitar6' },
    guitar7: { pt: 'guitarra 7', en: 'guitar7' },
    guitar8: { pt: 'guitarra 8', en: 'guitar8' },
    bass4: { pt: 'baixo 4', en: 'bass4' },
    bass5: { pt: 'baixo 5', en: 'bass5' },
    special: { pt: 'especial', en: 'special' },
  };
  return labels[family][lang];
};

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, locked = false, compact = false, lang = 'en' }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const canUseImage = Boolean(theme.image) && !imageFailed;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${compact ? 'aspect-[16/10]' : 'aspect-[16/11]'} ${locked ? 'grayscale' : ''}`}
      style={{
        background: theme.placeholderGradient,
        borderColor: locked ? 'rgba(148,163,184,0.22)' : theme.glowColor || 'rgba(59,130,246,0.35)',
        boxShadow: locked ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : `0 18px 40px ${theme.glowColor || 'rgba(37,99,235,0.18)'}, inset 0 1px 0 rgba(255,255,255,0.16)`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.30),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.16),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_42%,rgba(2,6,23,0.22))]" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,transparent_0%,rgba(255,255,255,0.12)_44%,transparent_58%)] opacity-60 transition duration-500 group-hover:translate-x-2" />
      {canUseImage ? (
        <>
          <div className="absolute inset-3 rounded-xl bg-black/12 blur-xl" />
          <img
            src={theme.image}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-contain p-3 transition duration-500 ${locked ? 'opacity-24 blur-[1px]' : 'opacity-95 drop-shadow-[0_18px_28px_rgba(2,6,23,0.30)] group-hover:scale-[1.025]'}`}
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.10),transparent_45%,rgba(2,6,23,0.22))]" />
          <span className="absolute left-8 top-7 h-1 w-1 rounded-full bg-white/45" />
          <span className="absolute right-9 top-12 h-1 w-1 rounded-full bg-white/30" />
        </>
      ) : (
        <svg viewBox="0 0 320 180" className={`absolute inset-0 h-full w-full transition duration-500 ${locked ? 'opacity-30' : 'opacity-78 group-hover:scale-[1.025]'}`} aria-hidden="true">
          <path
            d={silhouettePath(theme.instrumentFamily)}
            fill="rgba(255,255,255,0.22)"
          />
          <path
            d="M66 105 C99 88 125 86 160 90 L228 98 C246 100 260 94 273 81"
            fill="none"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {tunerPoints(theme.instrumentFamily).map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="rgba(2,6,23,0.26)" stroke="rgba(255,255,255,0.42)" strokeWidth="2" />
          ))}
        </svg>
      )}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="rounded-full border border-white/20 bg-black/18 px-2.5 py-1 text-[9px] font-black uppercase text-white/82 backdrop-blur-sm">
          {familyLabel(theme.instrumentFamily, lang)}
        </span>
        <span className="rounded-full border border-white/20 bg-black/18 px-2.5 py-1 text-[9px] font-black uppercase text-white/82 backdrop-blur-sm">
          {getThemeLevelLabel(theme, lang)}
        </span>
      </div>
    </div>
  );
};

export default ThemePreview;
