import { listMovies } from '../api'
import { useAsync } from '../lib/useAsync'
import { Poster } from '../components/Poster'
import { duration } from '../lib/format'

export function SoonPage() {
  const { data } = useAsync(() => listMovies('soon'), [])
  return (
    <section className="container">
      <div className="section-head">
        <h2>Скоро в кино</h2>
      </div>
      <div className="grid">
        {data?.map((m) => (
          <article key={m.id} className="card">
            <Poster movie={m} />
            <div className="card-body">
              <span className="eyebrow">
                с {new Date(m.releaseDate!).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </span>
              <h3>{m.title}</h3>
              <p className="muted">
                {m.genres.join(', ')} · {duration(m.durationMin)} · {m.ageRating}
              </p>
              <p className="desc">{m.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
