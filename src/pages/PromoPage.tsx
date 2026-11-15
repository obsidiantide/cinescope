import { Link } from 'react-router-dom'

const PROMOS = [
  {
    title: 'Дневные сеансы',
    text: 'На сеансы до 18:00 действуют базовые цены — без вечерней наценки.',
    tag: 'Каждый день',
    colors: ['#f79e1b', '#e31b23'],
    link: '/schedule',
  },
  {
    title: 'Lounge для двоих',
    text: 'Диваны на двоих в залах Lounge: широкие кресла, столики и отдельный вход.',
    tag: 'Залы Lounge',
    colors: ['#7a1be3', '#f71bb5'],
    link: '/cinemas',
  },
  {
    title: 'IMAX и Dolby Atmos',
    text: 'Самый большой экран и объёмный звук. Выберите место в 3D и посмотрите вид с кресла до покупки.',
    tag: 'Премиальные форматы',
    colors: ['#1b6fe3', '#1bd3f7'],
    link: '/schedule',
  },
]

export function PromoPage() {
  return (
    <section className="wrap section">
      <div className="section-head">
        <h2>Акции и спецпредложения</h2>
      </div>
      <div className="promo-grid">
        {PROMOS.map((p) => (
          <Link key={p.title} to={p.link} className="promo-card" style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}>
            <span className="promo-tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            <span className="promo-more">Подробнее</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
