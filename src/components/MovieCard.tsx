import { Link } from 'react-router-dom'
import type { Movie, Session } from '../types'
import { Poster } from './Poster'
import { AgeBadge, FormatBadge, LangBadge } from './Badges'
import { duration, time } from '../lib/format'

export function MovieCard({ movie, sessions, query }: { movie: Movie; sessions: Session[]; query: string }) {
  const formats = [...new Set(sessions.map((s) => s.format))]
  const langs = [...new Map(sessions.map((s) => [s.language + (s.subtitles ?? ''), s])).values()]
  const link = `/movie/${movie.id}${query ? `?${query}` : ''}`
  return (
    <article className="movie-card">
      <Link to={link} className="movie-card-poster">
        <Poster movie={movie} />
        {movie.isNew && <span className="ribbon">NEW</span>}
        <AgeBadge age={movie.ageRating} />
      </Link>
      <div className="movie-card-body">
        <div className="badges">
          {formats.map((f) => (
            <FormatBadge key={f} format={f} />
          ))}
          {langs.map((s) => (
            <LangBadge key={s.language + (s.subtitles ?? '')} lang={s.language} sub={s.subtitles} />
          ))}
        </div>
        <Link to={link}>
          <h3>{movie.title}</h3>
        </Link>
        <p className="muted small">
          {movie.genres.join(', ')} · {duration(movie.durationMin)}
        </p>
        <div className="times">
          {sessions.slice(0, 4).map((s) => (
            <Link key={s.id} to={`/session/${s.id}`} className="time-chip" title={`${s.format} · ${s.language}`}>
              {time(s.startsAt)}
            </Link>
          ))}
          {sessions.length > 4 && <span className="muted small">+{sessions.length - 4}</span>}
        </div>
        <Link to={link} className="btn outline block">
          Сеансы
        </Link>
      </div>
    </article>
  )
}
