import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSession, listOrders, refundOrder } from '../api'
import { useAsync } from '../lib/useAsync'
import { TicketCard } from '../components/TicketCard'
import { currency } from '../lib/format'

export function TicketsPage() {
  const [v, setV] = useState(0)
  const data = useAsync(async () => {
    const orders = await listOrders()
    const full = await Promise.all(orders.map(async (o) => ({ order: o, ...(await getSession(o.sessionId)) })))
    return full.filter((x) => x.session) as Required<(typeof full)[number]>[]
  }, [v])

  return (
    <section className="container">
      <div className="section-head">
        <h2>Мои билеты</h2>
      </div>
      {data.loading && !data.data ? (
        <div className="loader">Загрузка…</div>
      ) : !data.data?.length ? (
        <div className="empty">
          <p className="muted">Здесь появятся купленные билеты.</p>
          <Link to="/" className="btn primary">
            Выбрать фильм
          </Link>
        </div>
      ) : (
        data.data.map((x) => (
          <div key={x.order.id} className="order-block">
            <div className="order-head">
              <b>
                Заказ {x.order.id} · {currency(x.order.total)}
              </b>
              {x.order.status === 'paid' ? (
                <button
                  className="btn small ghost"
                  onClick={async () => {
                    await refundOrder(x.order.id)
                    setV((n) => n + 1)
                  }}
                >
                  Вернуть билеты
                </button>
              ) : (
                <span className="pill">Возврат оформлен</span>
              )}
            </div>
            <TicketCard {...x} />
          </div>
        ))
      )}
    </section>
  )
}
