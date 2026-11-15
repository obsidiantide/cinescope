import { cinemas } from '../data/cinemas'
import { dateKey, dateShort, dayLabel } from '../lib/format'
import { LANGUAGES, useFilters } from '../lib/filters'
import { nextDays } from './DateStrip'

export function FilterBar() {
  const { date, cinemaId, language, set } = useFilters()
  const days = nextDays()
  const quick = days.slice(0, 2)
  const isQuick = quick.some((d) => dateKey(d) === date)
  return (
    <div className="filter-bar">
      <div className="day-tabs" role="tablist" aria-label="День">
        {quick.map((d) => {
          const k = dateKey(d)
          return (
            <button key={k} role="tab" aria-selected={k === date} className={k === date ? 'active' : ''} onClick={() => set('date', k)}>
              {dayLabel(d)}
            </button>
          )
        })}
        <label className={`select day-select ${!isQuick ? 'active' : ''}`}>
          <select value={isQuick ? '' : date} onChange={(e) => set('date', e.target.value || undefined)} aria-label="Другая дата">
            <option value="">Другой день</option>
            {days.slice(2).map((d) => (
              <option key={dateKey(d)} value={dateKey(d)}>
                {dayLabel(d)}, {dateShort(d)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="select">
        <select value={cinemaId ?? ''} onChange={(e) => set('cinema', e.target.value || undefined)} aria-label="Кинотеатр">
          <option value="">Все кинотеатры</option>
          {cinemas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="select">
        <select value={language ?? ''} onChange={(e) => set('lang', e.target.value || undefined)} aria-label="Язык">
          <option value="">Все языки</option>
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
