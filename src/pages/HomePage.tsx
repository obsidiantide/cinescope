import type { Movie } from '../types'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMovies, listSessions } from '../api'
import { useAsync } from '../lib/useAsync'
import { useFilters } from '../lib/filters'
import { Poster } from '../components/Poster'
import { FilterBar } from '../components/FilterBar'
import { MovieCard } from '../components/MovieCard'
import { AgeBadge } from '../components/Badges'
import { duration } from '../lib/format'

export function HomePage() {
  const { date, cinemaId, language, query } = useFilters()
  const movies = useAsync(() => listMovies(), [])
  const sessions = useAsync(() => listSessions({ date, cinemaId, language }), [date, cinemaId, language])
  const now = (movies.data ?? []).filter((m) => m.status === 'now')
  const soon = (movies.data ?? []).filter((m) => m.status === 'soon')
  const featured = useMemo(() => now.filter((m) => m.isNew), [now])

  const list = now
    .map((m) => ({ movie: m, sessions: (sessions.data ?? []).filter((s) => s.movieId === m.id) }))
    .filter((x) => x.sessions.length)

  return (
    <>
      {featured.length > 0 && <HeroSlider items={featured} />}

      <section className="wrap section">
        <div className="section-head">
          <h2>Сейчас в кино</h2>
          <Link to={`/schedule${query ? `?${query}` : ''}`} className="link-more">
            Всё расписание
          </Link>
        </div>
        <FilterBar />
        {(movies.loading && !movies.data) || (sessions.loading && !sessions.data) ? (
          <div className="loader">Загрузка афиши…</div>
        ) : list.length ? (
          <div className="movie-grid">
            {list.map((x) => (
              <MovieCard key={x.movie.id} movie={x.movie} sessions={x.sessions} query={query} />
            ))}
          </div>
        ) : (
          <div className="empty-box">По выбранным фильтрам сеансов нет. Попробуйте другой день, кинотеатр или язык.</div>
        )}
      </section>

      {soon.length > 0 && (
        <section className="wrap section">
          <div className="section-head">
            <h2>Скоро в кино</h2>
            <Link to="/soon" className="link-more">
              Все премьеры
            </Link>
          </div>
          <div className="soon-row">
            {soon.map((m) => (
              <Link key={m.id} to={`/movie/${m.id}`} className="soon-card">
                <Poster movie={m} />
                <span className="soon-date">
                  с {new Date(m.releaseDate!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
                <b>{m.title}</b>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function HeroSlider({ items }: { items: Movie[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [items.length])
  const m = items[i]
  return (
    <section className="hero" style={{ ['--c1' as string]: m.palette[1], ['--c2' as string]: m.palette[2] }}>
      <div className="hero-bg" key={m.id} />
      <div className="wrap hero-inner">
        <div className="hero-content" key={m.id}>
          <span className="eyebrow">Премьера · ★ {m.rating.toFixed(1)}</span>
          <h1>{m.title}</h1>
          <p className="tagline">{m.tagline}</p>
          <p className="hero-meta">
            <AgeBadge age={m.ageRating} /> {m.genres.join(', ')} · {duration(m.durationMin)}
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to={`/movie/${m.id}`}>
              Купить билет
            </Link>
            <Link className="btn ghost-light" to={`/movie/${m.id}`}>
              О фильме
            </Link>
          </div>
          <div className="dots">
            {items.map((x, k) => (
              <button key={x.id} className={k === i ? 'active' : ''} onClick={() => setI(k)} aria-label={x.title} />
            ))}
          </div>
        </div>
        <Poster movie={m} className="hero-poster" />
      </div>
    </section>
  )
}
