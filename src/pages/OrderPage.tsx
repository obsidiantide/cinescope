import { Link, useParams } from 'react-router-dom'
import { getOrder, getSession } from '../api'
import { useAsync } from '../lib/useAsync'
import { TicketCard } from '../components/TicketCard'
import { currency } from '../lib/format'
import { NotFound } from './NotFound'

export function OrderPage() {
  const { id = '' } = useParams()
  const data = useAsync(async () => {
    const order = await getOrder(id)
    if (!order) return undefined
    const s = await getSession(order.sessionId)
    return s && { order, ...s }
  }, [id])
  if (data.loading) return <div className="loader">Загрузка…</div>
  if (!data.data) return <NotFound text="Заказ не найден" />
  const { order } = data.data
  return (
    <section className="container">
      <div className="success">
        <div className="check">✓</div>
        <div>
          <h2>Оплата прошла, приятного просмотра!</h2>
          <p className="muted">
            Заказ {order.id} · {currency(order.total)} · карта •••• {order.cardLast4}. Билеты отправлены на {order.email}.
          </p>
        </div>
      </div>
      <TicketCard {...data.data} />
      <div className="actions">
        <button className="btn" onClick={() => window.print()}>
          Распечатать
        </button>
        <Link className="btn ghost" to="/tickets">
          Все мои билеты
        </Link>
      </div>
    </section>
  )
}
