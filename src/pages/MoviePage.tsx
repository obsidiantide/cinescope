import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMovie, listSessions } from '../api'
import { useAsync } from '../lib/useAsync'
import { Poster } from '../components/Poster'
import { DateStrip } from '../components/DateStrip'
import { SessionChip } from '../components/SessionChip'
import { dateKey, duration } from '../lib/format'
import { halls } from '../data/halls'
import { NotFound } from './NotFound'

export function MoviePage() {
  const { id = '' } = useParams()
  const [date, setDate] = useState(dateKey(new Date()))
  const movie = useAsync(() => getMovie(id), [id])
  const sessions = useAsync(() => listSessions({ movieId: id, date }), [id, date])
  const byHall = useMemo(
    () => halls.map((h) => ({ hall: h, list: (sessions.data ?? []).filter((s) => s.hallId === h.id) })).filter((x) => x.list.length),
    [sessions.data],
  )

  if (movie.loading && !movie.data) return <div className="loader">Загрузка…</div>
  const m = movie.data
  if (!m) return <NotFound text="Фильм не найден" />

  return (
    <>
      <section className="movie-hero" style={{ ['--c1' as string]: m.palette[1], ['--c2' as string]: m.palette[2] }}>
        <div className="hero-bg" />
        <Poster movie={m} className="movie-hero-poster" />
        <div className="movie-hero-info">
          <span className="eyebrow">
            {m.ageRating} · {m.year} · {m.country}
          </span>
          <h1>{m.title}</h1>
          {m.originalTitle && <p className="muted">{m.originalTitle}</p>}
          <p className="tagline">{m.tagline}</p>
          <p>{m.description}</p>
          <dl className="facts">
            <div>
              <dt>Жанр</dt>
              <dd>{m.genres.join(', ')}</dd>
            </div>
            <div>
              <dt>Длительность</dt>
              <dd>{duration(m.durationMin)}</dd>
            </div>
            <div>
              <dt>Режиссёр</dt>
              <dd>{m.director}</dd>
            </div>
            <div>
              <dt>В ролях</dt>
              <dd>{m.cast.join(', ')}</dd>
            </div>
            {m.rating > 0 && (
              <div>
                <dt>Рейтинг</dt>
                <dd>★ {m.rating.toFixed(1)}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {m.status === 'now' ? (
        <section className="container">
          <div className="section-head">
            <h2>Сеансы</h2>
            <DateStrip value={date} onChange={setDate} />
          </div>
          {sessions.loading && !sessions.data ? (
            <div className="loader">Загрузка расписания…</div>
          ) : byHall.length ? (
            byHall.map(({ hall, list }) => (
              <div key={hall.id} className="hall-block">
                <h3>{hall.name}</h3>
                <div className="sessions">
                  {list.map((s) => (
                    <SessionChip key={s.id} s={s} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">На эту дату сеансов нет — выберите другой день.</p>
          )}
        </section>
      ) : (
        <section className="container">
          <p className="muted">Продажа билетов откроется ближе к премьере.</p>
        </section>
      )}
    </>
  )
}
