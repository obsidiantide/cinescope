/** Знак CineScope: изогнутый экран и ряды кресел на градиентной плашке. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e31b23" />
          <stop offset="1" stopColor="#f79e1b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-g)" />
      <path d="M14 22c12-6 24-6 36 0" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <g fill="#fff">
        <rect x="14" y="33" width="8" height="8" rx="2" />
        <rect x="28" y="33" width="8" height="8" rx="2" />
        <rect x="42" y="33" width="8" height="8" rx="2" />
        <rect x="21" y="45" width="8" height="8" rx="2" />
        <rect x="35" y="45" width="8" height="8" rx="2" />
      </g>
    </svg>
  )
}
