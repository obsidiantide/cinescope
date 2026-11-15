import { Link } from 'react-router-dom'

export function NotFound({ text = 'Страница не найдена' }: { text?: string }) {
  return (
    <section className="container empty">
      <h2>{text}</h2>
      <Link to="/" className="btn primary">
        На афишу
      </Link>
    </section>
  )
}
