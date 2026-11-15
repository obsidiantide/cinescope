import type { Movie } from '../types'

/** Генеративный постер: SVG из палитры и мотива фильма. */
export function Poster({ movie, className = '' }: { movie: Movie; className?: string }) {
  const [a, b, c] = movie.palette
  const id = movie.id
  return (
    <svg className={`poster ${className}`} viewBox="0 0 200 300" role="img" aria-label={`Постер: ${movie.title}`}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={b} />
          <stop offset="1" stopColor={a} />
        </linearGradient>
        <radialGradient id={`r-${id}`} cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor={c} stopOpacity="0.9" />
          <stop offset="1" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`f-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill={`url(#g-${id})`} />
      <rect width="200" height="300" fill={`url(#r-${id})`} />
      <Motif kind={movie.motif} color={c} />
      <rect width="200" height="300" fill={`url(#f-${id})`} />
      {titleLines(movie.title).map((line, i, arr) => (
        <text key={i} x="14" y={262 - (arr.length - 1 - i) * 22} fill="#fff" fontSize={arr.length > 1 ? 19 : 21} fontWeight="800" fontFamily="Manrope, sans-serif">
          {line}
        </text>
      ))}
      <text x="14" y="282" fill="#fff" opacity="0.65" fontSize="9" fontFamily="Manrope, sans-serif" letterSpacing="2">
        {movie.genres.join(' · ').toUpperCase()}
      </text>
    </svg>
  )
}

function Motif({ kind, color }: { kind: Movie['motif']; color: string }) {
  const s = { stroke: color, fill: 'none', strokeWidth: 1.5, opacity: 0.75 }
  switch (kind) {
    case 'sun':
      return (
        <g>
          <circle cx="100" cy="110" r="42" fill={color} opacity="0.9" />
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="100" y1="110" x2={100 + Math.cos((i * Math.PI) / 6) * 80} y2={110 + Math.sin((i * Math.PI) / 6) * 80} {...s} />
          ))}
        </g>
      )
    case 'rings':
      return (
        <g>
          <circle cx="100" cy="105" r="30" fill={color} opacity="0.85" />
          <ellipse cx="100" cy="105" rx="80" ry="18" {...s} transform="rotate(-18 100 105)" />
          <ellipse cx="100" cy="105" rx="64" ry="12" {...s} transform="rotate(-18 100 105)" />
          <circle cx="160" cy="60" r="3" fill="#fff" />
          <circle cx="40" cy="160" r="2" fill="#fff" />
        </g>
      )
    case 'grid':
      return (
        <g {...s}>
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={20 + i * 10} y={30 + i * 10} width={160 - i * 20} height={170 - i * 20} />
          ))}
        </g>
      )
    case 'waves':
      return (
        <g {...s}>
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M0 ${120 + i * 14} Q 50 ${105 + i * 14} 100 ${120 + i * 14} T 200 ${120 + i * 14}`} />
          ))}
        </g>
      )
    case 'eye':
      return (
        <g>
          <path d="M20 120 Q100 40 180 120 Q100 200 20 120Z" {...s} strokeWidth={2.5} />
          <circle cx="100" cy="120" r="28" fill={color} opacity="0.9" />
          <circle cx="100" cy="120" r="11" fill="#000" />
        </g>
      )
    case 'road':
      return (
        <g>
          <path d="M70 230 L96 90 L104 90 L130 230Z" fill="#000" opacity="0.45" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={99} y={100 + i * 22} width={2} height={10 + i * 2} fill={color} />
          ))}
          <circle cx="100" cy="80" r="26" fill={color} opacity="0.8" />
        </g>
      )
    case 'stars':
      return (
        <g fill={color}>
          {Array.from({ length: 26 }).map((_, i) => (
            <circle key={i} cx={(i * 73) % 190 + 5} cy={(i * 41) % 200 + 20} r={(i % 3) + 1} opacity={0.5 + (i % 4) * 0.12} />
          ))}
          <path d="M60 210 L60 160 L80 140 L80 210 M95 210 L95 130 L115 110 L115 210 M130 210 L130 150 L150 170 L150 210" stroke={color} fill="none" strokeWidth="2" />
        </g>
      )
    case 'tower':
      return (
        <g>
          <path d="M100 100 L200 60 L200 140Z" fill={color} opacity="0.35" />
          <path d="M88 220 L94 100 L106 100 L112 220Z" fill="#fff" opacity="0.85" />
          <rect x="91" y="88" width="18" height="12" fill={color} />
        </g>
      )
  }
}

/** Делит длинное название на две строки по пробелу, ближайшему к середине. */
function titleLines(title: string): string[] {
  if (title.length <= 14) return [title]
  const mid = title.length / 2
  let best = -1
  for (let i = 0; i < title.length; i++) if (title[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i
  return best < 0 ? [title] : [title.slice(0, best), title.slice(best + 1)]
}
