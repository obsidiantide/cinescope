import { Link } from 'react-router-dom'
import type { Session } from '../types'
import { currency, time } from '../lib/format'

export function SessionChip({ s }: { s: Session }) {
  return (
    <Link to={`/session/${s.id}`} className="session-chip">
      <b>{time(s.startsAt)}</b>
      <span>
        {s.format === 'Dolby Atmos' ? 'ATMOS' : s.format} · {s.language}
        {s.subtitles ? ' sub' : ''}
      </span>
      <small>от {currency(s.prices.standard)}</small>
    </Link>
  )
}
