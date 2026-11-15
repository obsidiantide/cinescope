import type { Format, Language } from '../types'

export function AgeBadge({ age }: { age: string }) {
  return <span className={`badge age a${parseInt(age)}`}>{age}</span>
}

export function LangBadge({ lang, sub }: { lang: Language; sub?: Language }) {
  return (
    <span className="badge lang" title={sub ? `Субтитры: ${sub}` : undefined}>
      {lang}
      {sub ? <small>sub</small> : null}
    </span>
  )
}

export function FormatBadge({ format }: { format: Format }) {
  const cls = format === 'IMAX' ? 'imax' : format === 'Dolby Atmos' ? 'atmos' : format === '3D' ? 'f3d' : ''
  return <span className={`badge fmt ${cls}`}>{format === 'Dolby Atmos' ? 'ATMOS' : format}</span>
}
