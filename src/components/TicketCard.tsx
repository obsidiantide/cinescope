import { QRCodeSVG } from 'qrcode.react'
import type { Hall, Movie, Order, Session } from '../types'
import { currency, dateLong, seatTypeLabel, time } from '../lib/format'

export function TicketCard({ order, movie, session, hall }: { order: Order; movie: Movie; session: Session; hall: Hall }) {
  return (
    <div className={`tickets ${order.status === 'refunded' ? 'refunded' : ''}`}>
      {order.tickets.map((t) => (
        <article key={t.seatId} className="ticket" style={{ ['--c1' as string]: movie.palette[1] }}>
          <div className="ticket-main">
            <span className="eyebrow">CineScope · {hall.name}</span>
            <h3>{movie.title}</h3>
            <p>
              {dateLong(session.startsAt)}, <b>{time(session.startsAt)}</b>
            </p>
            <div className="ticket-seat">
              <div>
                <small>Ряд</small>
                <b>{t.row}</b>
              </div>
              <div>
                <small>Место</small>
                <b>{t.number}</b>
              </div>
              <div>
                <small>Тип</small>
                <b>{seatTypeLabel[t.type]}</b>
              </div>
              <div>
                <small>Цена</small>
                <b>{currency(t.price)}</b>
              </div>
            </div>
          </div>
          <div className="ticket-stub">
            <QRCodeSVG value={`CINESCOPE|${order.id}|${session.id}|${t.seatId}`} size={104} bgColor="transparent" fgColor="#0b0b12" />
            <small>{order.id}</small>
          </div>
        </article>
      ))}
    </div>
  )
}
