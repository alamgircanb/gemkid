// Original GemKid artwork, drawn in code (see docs/ASSETS.md).
import type { AvatarId, ShapeId } from '../domain/types.ts';

const AVATAR_COLOURS: Record<AvatarId, [string, string]> = {
  lumi: ['#818cf8', '#4f46e5'],
  ruby: ['#fb7185', '#be123c'],
  jade: ['#4ade80', '#15803d'],
  topaz: ['#fbbf24', '#b45309'],
  sapphire: ['#60a5fa', '#1d4ed8'],
  amethyst: ['#c084fc', '#7e22ce'],
};

export function GemLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <polygon points="16,6 48,6 60,22 32,60 4,22" fill="#6366f1" />
      <polygon points="16,6 26,22 4,22" fill="#a5b4fc" />
      <polygon points="48,6 38,22 60,22" fill="#4338ca" />
      <polygon points="26,22 38,22 32,60" fill="#818cf8" />
      <polygon points="16,6 48,6 38,22 26,22" fill="#c7d2fe" />
    </svg>
  );
}

/** Lumi: an original rounded gem companion. Accessories are cosmetic rewards. */
export function Lumi({
  size = 160,
  colour = 'lumi',
  accessories = [],
  mood = 'happy',
  title,
}: {
  size?: number;
  colour?: AvatarId;
  accessories?: string[];
  mood?: 'happy' | 'cheer' | 'think';
  title?: string;
}) {
  const [light, dark] = AVATAR_COLOURS[colour];
  const id = `g-${colour}`;
  return (
    <svg width={size} height={size} viewBox="0 -14 120 134" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d="M30 22 Q60 8 90 22 L108 50 Q110 56 104 62 L66 106 Q60 112 54 106 L16 62 Q10 56 12 50 Z" fill={`url(#${id})`} />
      <path d="M30 22 Q60 14 90 22 L76 44 L44 44 Z" fill="#fff" opacity="0.35" />
      <path d="M44 44 L60 104" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M76 44 L60 104" stroke="#fff" strokeOpacity="0.15" strokeWidth="3" />
      {/* face */}
      {mood === 'think' ? (
        <>
          <circle cx="48" cy="60" r="5" fill="#1e1b4b" />
          <circle cx="72" cy="58" r="5" fill="#1e1b4b" />
          <path d="M52 76 Q62 72 70 76" stroke="#1e1b4b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="60" rx="5" ry="6" fill="#1e1b4b" />
          <ellipse cx="72" cy="60" rx="5" ry="6" fill="#1e1b4b" />
          <circle cx="50" cy="58" r="1.8" fill="#fff" />
          <circle cx="74" cy="58" r="1.8" fill="#fff" />
          <path d={mood === 'cheer' ? 'M48 72 Q60 86 72 72 Z' : 'M50 73 Q60 81 70 73'} stroke="#1e1b4b" strokeWidth="3.5" fill={mood === 'cheer' ? '#1e1b4b' : 'none'} strokeLinecap="round" />
          <circle cx="40" cy="70" r="4" fill="#f9a8d4" opacity="0.7" />
          <circle cx="80" cy="70" r="4" fill="#f9a8d4" opacity="0.7" />
        </>
      )}
      {accessories.includes('glasses') && (
        <g stroke="#111827" strokeWidth="2.5" fill="none">
          <circle cx="48" cy="60" r="9" />
          <circle cx="72" cy="60" r="9" />
          <path d="M57 60 L63 60" />
        </g>
      )}
      {accessories.includes('scarf') && (
        <g>
          <path d="M28 82 Q60 98 92 82 L90 90 Q60 104 30 90 Z" fill="#ef4444" />
          <rect x="70" y="88" width="9" height="20" rx="3" fill="#dc2626" />
        </g>
      )}
      {accessories.includes('hat-star') && (
        <g>
          <path d="M40 22 L60 -2 L80 22 Z" fill="#facc15" stroke="#a16207" strokeWidth="2" />
          <circle cx="60" cy="-1" r="4" fill="#fde047" />
        </g>
      )}
      {accessories.includes('crown') && (
        <path d="M42 22 L44 6 L52 14 L60 2 L68 14 L76 6 L78 22 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
      )}
    </svg>
  );
}

export function Avatar({ id, size = 44 }: { id: AvatarId; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <Lumi size={size * 0.9} colour={id} />
    </span>
  );
}

export function GemDot({ colour = '#6366f1', size = 18 }: { colour?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <polygon points="5,2 15,2 19,7 10,18 1,7" fill={colour} />
      <polygon points="5,2 15,2 12,7 8,7" fill="#fff" opacity="0.45" />
    </svg>
  );
}

/** Shapes always come with a text name nearby; colour is never the only cue. */
export function Shape({ shape, size = 40, label }: { shape: ShapeId; size?: number; label?: string }) {
  const common = { strokeWidth: 3, stroke: '#1f2937' };
  let el;
  switch (shape) {
    case 'circle':
      el = <circle cx="20" cy="20" r="15" fill="#fb923c" {...common} />;
      break;
    case 'triangle':
      el = <polygon points="20,4 36,34 4,34" fill="#a78bfa" {...common} />;
      break;
    case 'square':
      el = <rect x="6" y="6" width="28" height="28" rx="3" fill="#60a5fa" {...common} />;
      break;
    case 'star':
      el = <polygon points="20,3 25,15 38,15 27,23 31,36 20,28 9,36 13,23 2,15 15,15" fill="#facc15" {...common} />;
      break;
    case 'diamond':
      el = <polygon points="20,3 36,20 20,37 4,20" fill="#2dd4bf" {...common} />;
      break;
    case 'heart':
      el = <path d="M20 35 L6 21 A8 8 0 0 1 20 11 A8 8 0 0 1 34 21 Z" fill="#f472b6" {...common} />;
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      {el}
    </svg>
  );
}

export function Robot({ dir, size = 28 }: { dir: 'N' | 'E' | 'S' | 'W'; size?: number }) {
  const rot = { N: 0, E: 90, S: 180, W: 270 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" style={{ transform: `rotate(${rot}deg)` }}>
      <rect x="8" y="10" width="24" height="24" rx="6" fill="#4f46e5" />
      <rect x="13" y="16" width="5" height="5" rx="1" fill="#fff" />
      <rect x="22" y="16" width="5" height="5" rx="1" fill="#fff" />
      <polygon points="20,1 27,10 13,10" fill="#f97316" />
    </svg>
  );
}
