import { dateKey, dateShort, dayLabel } from '../lib/format'

export function nextDays(n = 7) {
  const t = new Date()
  return Array.from({ length: n }, (_, i) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + i))
}

export function DateStrip({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  return (
    <div className="date-strip" role="tablist" aria-label="Дата сеанса">
      {nextDays().map((d) => {
        const k = dateKey(d)
        return (
          <button key={k} role="tab" aria-selected={k === value} className={k === value ? 'active' : ''} onClick={() => onChange(k)}>
            <span>{dayLabel(d)}</span>
            <b>{dateShort(d)}</b>
          </button>
        )
      })}
    </div>
  )
}
