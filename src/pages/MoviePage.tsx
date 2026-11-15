import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getMovie, listSessions } from '../api'
import { useAsync } from '../lib/useAsync'
import { Poster } from '../components/Poster'
import { FilterBar } from '../components/FilterBar'
import { AgeBadge } from '../components/Badges'
import { useFilters } from '../lib/filters'
import { cinemas } from '../data/cinemas'
import { SessionChip } from '../components/SessionChip'
import { duration } from '../lib/format'
import { halls } from '../data/halls'
import { NotFound } from './NotFound'

export function MoviePage() {
  const { id = '' } = useParams()
  const { date, cinemaId, language } = useFilters()
  const movie = useAsync(() => getMovie(id), [id])
  const sessions = useAsync(() => listSessions({ movieId: id, date, cinemaId, language }), [id, date, cinemaId, language])
  const byCinema = useMemo(
    () =>
      cinemas
        .map((c) => ({
          cinema: c,
          halls: halls
            .filter((h) => h.cinemaId === c.id)
            .map((h) => ({ hall: h, list: (sessions.data ?? []).filter((s) => s.hallId === h.id) }))
            .filter((x) => x.list.length),
        }))
        .filter((x) => x.halls.length),
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
            <AgeBadge age={m.ageRating} /> {m.year} · {m.country}
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
          </div>
          <FilterBar />
          {sessions.loading && !sessions.data ? (
            <div className="loader">Загрузка расписания…</div>
          ) : byCinema.length ? (
            byCinema.map(({ cinema, halls: hs }) => (
              <div key={cinema.id} className="cinema-block">
                <div className="cinema-block-head">
                  <h3>{cinema.name}</h3>
                  <span className="muted small">
                    {cinema.mall}, {cinema.address}
                  </span>
                </div>
                {hs.map(({ hall, list }) => (
                  <div key={hall.id} className="hall-row">
                    <span className="hall-name">{hall.name}</span>
                    <div className="sessions">
                      {list.map((s) => (
                        <SessionChip key={s.id} s={s} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="empty-box">По выбранным фильтрам сеансов нет — выберите другой день, кинотеатр или язык.</div>
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
