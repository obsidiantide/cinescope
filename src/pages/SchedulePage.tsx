import { Link } from 'react-router-dom'
import { listSessions } from '../api'
import { useAsync } from '../lib/useAsync'
import { useFilters } from '../lib/filters'
import { FilterBar } from '../components/FilterBar'
import { AgeBadge, FormatBadge, LangBadge } from '../components/Badges'
import { Poster } from '../components/Poster'
import { getMovieById } from '../data/movies'
import { getCinemaById } from '../data/cinemas'
import { getHallById } from '../data/halls'
import { currency, time } from '../lib/format'

export function SchedulePage() {
  const { date, cinemaId, language } = useFilters()
  const sessions = useAsync(() => listSessions({ date, cinemaId, language }), [date, cinemaId, language])

  return (
    <section className="wrap section">
      <div className="section-head">
        <h2>Расписание</h2>
      </div>
      <FilterBar />
      {sessions.loading && !sessions.data ? (
        <div className="loader">Загрузка расписания…</div>
      ) : !sessions.data?.length ? (
        <div className="empty-box">По выбранным фильтрам сеансов нет.</div>
      ) : (
        <div className="table-wrap">
          <table className="schedule">
            <thead>
              <tr>
                <th>Фильм</th>
                <th>Время</th>
                <th>Кинотеатр</th>
                <th>Зал</th>
                <th>Формат</th>
                <th>Цена</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.data.map((s) => {
                const m = getMovieById(s.movieId)!
                return (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/movie/${m.id}`} className="sch-movie">
                        <Poster movie={m} className="thumb" />
                        <span>
                          <b>{m.title}</b>
                          <AgeBadge age={m.ageRating} />
                        </span>
                      </Link>
                    </td>
                    <td className="sch-time">{time(s.startsAt)}</td>
                    <td>{getCinemaById(s.cinemaId)?.name}</td>
                    <td className="muted">{getHallById(s.hallId)?.name.replace(/ · .*/, '')}</td>
                    <td>
                      <span className="badges">
                        <FormatBadge format={s.format} />
                        <LangBadge lang={s.language} sub={s.subtitles} />
                      </span>
                    </td>
                    <td className="nowrap">от {currency(s.prices.standard)}</td>
                    <td>
                      <Link to={`/session/${s.id}`} className="btn primary small">
                        Купить
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
