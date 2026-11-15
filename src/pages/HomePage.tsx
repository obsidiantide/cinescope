import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMovies, listSessions } from '../api'
import { useAsync } from '../lib/useAsync'
import { Poster } from '../components/Poster'
import { DateStrip } from '../components/DateStrip'
import { SessionChip } from '../components/SessionChip'
import { dateKey, duration } from '../lib/format'
import type { Genre } from '../types'

export function HomePage() {
  const [date, setDate] = useState(dateKey(new Date()))
  const [genre, setGenre] = useState<Genre | 'all'>('all')
  const movies = useAsync(() => listMovies('now'), [])
  const sessions = useAsync(() => listSessions({ date }), [date])

  const genres = useMemo(() => [...new Set(movies.data?.flatMap((m) => m.genres) ?? [])], [movies.data])
  const featured = useMemo(() => movies.data && [...movies.data].sort((a, b) => b.rating - a.rating)[0], [movies.data])
  const list = (movies.data ?? []).filter((m) => genre === 'all' || m.genres.includes(genre))

  return (
    <>
      {featured && (
        <section className="hero" style={{ ['--c1' as string]: featured.palette[1], ['--c2' as string]: featured.palette[2] }}>
          <div className="hero-bg" />
          <div className="hero-content">
            <span className="eyebrow">Сейчас в прокате · ★ {featured.rating}</span>
            <h1>{featured.title}</h1>
            <p className="tagline">{featured.tagline}</p>
            <p className="muted">
              {featured.genres.join(', ')} · {duration(featured.durationMin)} · {featured.ageRating}
            </p>
            <div className="hero-actions">
              <Link className="btn primary" to={`/movie/${featured.id}`}>
                Купить билет
              </Link>
              <a className="btn ghost" href="#afisha">
                Вся афиша
              </a>
            </div>
          </div>
          <Poster movie={featured} className="hero-poster" />
        </section>
      )}

      <section id="afisha" className="container">
        <div className="section-head">
          <h2>Афиша</h2>
          <DateStrip value={date} onChange={setDate} />
        </div>
        <div className="chips">
          <button className={genre === 'all' ? 'chip active' : 'chip'} onClick={() => setGenre('all')}>
            Все жанры
          </button>
          {genres.map((g) => (
            <button key={g} className={genre === g ? 'chip active' : 'chip'} onClick={() => setGenre(g)}>
              {g}
            </button>
          ))}
        </div>

        {movies.loading && !movies.data ? (
          <div className="loader">Загрузка афиши…</div>
        ) : (
          <div className="movie-list">
            {list.map((m) => {
              const ms = (sessions.data ?? []).filter((s) => s.movieId === m.id)
              return (
                <article key={m.id} className="movie-row">
                  <Link to={`/movie/${m.id}`} className="movie-row-poster">
                    <Poster movie={m} />
                    <span className="age">{m.ageRating}</span>
                  </Link>
                  <div className="movie-row-body">
                    <Link to={`/movie/${m.id}`}>
                      <h3>{m.title}</h3>
                    </Link>
                    <p className="muted">
                      {m.genres.join(', ')} · {duration(m.durationMin)} · {m.country}
                    </p>
                    <p className="desc">{m.description}</p>
                    <div className="sessions">
                      {ms.length ? ms.map((s) => <SessionChip key={s.id} s={s} />) : <span className="muted">На эту дату сеансов нет</span>}
                    </div>
                  </div>
                  <div className="rating" title="Рейтинг зрителей">
                    ★ {m.rating.toFixed(1)}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
