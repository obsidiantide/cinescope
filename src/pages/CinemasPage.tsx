import { Link } from 'react-router-dom'
import { cinemas } from '../data/cinemas'
import { halls } from '../data/halls'
import { FormatBadge } from '../components/Badges'

export function CinemasPage() {
  return (
    <section className="wrap section">
      <div className="section-head">
        <h2>Кинотеатры</h2>
      </div>
      <div className="cinema-grid">
        {cinemas.map((c) => {
          const hs = halls.filter((h) => h.cinemaId === c.id)
          const seats = hs.reduce((a, h) => a + h.rows.reduce((b, r) => b + r.seats, 0), 0)
          return (
            <article key={c.id} className="cinema-card">
              <div className="cinema-cover" style={{ background: `linear-gradient(135deg, ${c.palette[0]}, ${c.palette[1]})` }}>
                <span>{c.name}</span>
              </div>
              <div className="cinema-body">
                <h3>{c.mall}</h3>
                <p className="muted">
                  {c.address}
                  <br />
                  Метро «{c.metro}» · {c.phone}
                </p>
                <div className="badges">
                  {[...new Set(hs.map((h) => h.format))].map((f) => (
                    <FormatBadge key={f} format={f} />
                  ))}
                </div>
                <ul className="hall-list">
                  {hs.map((h) => (
                    <li key={h.id}>{h.name}</li>
                  ))}
                </ul>
                <p className="muted small">
                  {hs.length} {hs.length > 4 ? 'залов' : 'зала'} · {seats} мест
                </p>
                <Link to={`/schedule?cinema=${c.id}`} className="btn outline block">
                  Расписание кинотеатра
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
