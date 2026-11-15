import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getSession, PaymentError, purchase } from '../api'
import { useAsync } from '../lib/useAsync'
import { useBooking } from '../store/booking'
import { hallSeats } from '../data/halls'
import { currency, dateLong, seatTypeLabel, time } from '../lib/format'
import { Poster } from '../components/Poster'
import { NotFound } from './NotFound'

const HOLD_SECONDS = 10 * 60

export function CheckoutPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const data = useAsync(() => getSession(id), [id])
  const { selected, sessionId, clear } = useBooking()
  const [form, setForm] = useState({ name: '', email: '', op: '50', phone: '', number: '', expiry: '', cvc: '', club: '' })
  const [method, setMethod] = useState<'card' | 'club'>('card')
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [left, setLeft] = useState(HOLD_SECONDS)

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const seats = useMemo(() => {
    if (!data.data) return []
    const map = new Map(hallSeats(data.data.hall).map((s) => [s.id, s]))
    return selected.map((sid) => map.get(sid)!).filter(Boolean)
  }, [data.data, selected])

  // после успешной оплаты выбор очищается — не уводим со страницы, пока идёт переход к билетам
  if (!paying && (sessionId !== id || !selected.length)) return <Navigate to={`/session/${id}`} replace />
  if (data.loading && !data.data) return <div className="loader">Загрузка…</div>
  if (!data.data) return <NotFound text="Сеанс не найден" />
  const { session, movie, hall, cinema } = data.data
  const total = seats.reduce((a, s) => a + session.prices[s.type], 0)

  if (left === 0)
    return (
      <section className="container empty">
        <h2>Время брони истекло</h2>
        <p className="muted">Места снова доступны для других зрителей.</p>
        <Link to={`/session/${id}`} className="btn primary">
          Выбрать места заново
        </Link>
      </section>
    )

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v = e.target.value
    if (k === 'phone') v = v.replace(/\D/g, '').slice(0, 7).replace(/^(\d{3})(\d{1,2})?(\d{1,2})?/, (_, a, b, c) => [a, b, c].filter(Boolean).join('-'))
    if (k === 'club') v = v.replace(/\D/g, '').slice(0, 10)
    if (k === 'number') v = v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
    if (k === 'expiry') v = v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
    if (k === 'cvc') v = v.replace(/\D/g, '').slice(0, 3)
    setForm((f) => ({ ...f, [k]: v }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.phone.replace(/\D/g, '').length !== 7) return setError('Укажите номер телефона полностью')
    if (method === 'card') {
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) return setError('Укажите срок действия в формате ММ/ГГ')
      if (form.cvc.length !== 3) return setError('CVC — три цифры на обороте карты')
    }
    setPaying(true)
    try {
      const order = await purchase({
        sessionId: id,
        seatIds: selected,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: `+994 ${form.op} ${form.phone}`,
        method,
        clubCard: form.club,
        card: { number: form.number, expiry: form.expiry, cvc: form.cvc },
      })
      clear()
      nav(`/order/${order.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof PaymentError ? err.message : 'Не удалось провести оплату, попробуйте ещё раз')
      setPaying(false)
    }
  }

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <section className="container checkout">
      <div className="checkout-summary">
        <Poster movie={movie} />
        <div>
          <span className="eyebrow">Ваш заказ</span>
          <h2>{movie.title}</h2>
          <p className="muted">
            {dateLong(session.startsAt)}, {time(session.startsAt)}
            <br />
            {cinema.name} · {hall.name}
            {hall.format !== session.format ? ` · ${session.format}` : ''} · {session.language}
          </p>
          <ul className="lines">
            {seats.map((s) => (
              <li key={s.id}>
                <span>
                  Ряд {s.row}, место {s.number} <small>{seatTypeLabel[s.type]}</small>
                </span>
                <b>{currency(session.prices[s.type])}</b>
              </li>
            ))}
            <li className="sum">
              <span>Итого</span>
              <b>{currency(total)}</b>
            </li>
          </ul>
          <p className={left < 60 ? 'hold warn' : 'hold'}>
            Места забронированы на {mm}:{ss}
          </p>
          <Link to={`/session/${id}`} className="back">
            ← Изменить места
          </Link>
        </div>
      </div>

      <form className="pay-form" onSubmit={submit}>
        <h2>Оплата</h2>
        <label>
          Имя
          <input required value={form.name} onChange={set('name')} placeholder="Как к вам обращаться" autoComplete="name" />
        </label>
        <label>
          E-mail для билетов
          <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
        </label>
        <label>
          Мобильный телефон
          <span className="phone">
            <span className="phone-cc">+994</span>
            <select value={form.op} onChange={set('op')} aria-label="Код оператора">
              {['10', '50', '51', '55', '60', '70', '77', '99'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <input required inputMode="numeric" value={form.phone} onChange={set('phone')} placeholder="000-00-00" autoComplete="tel-local" />
          </span>
        </label>
        <div className="pay-methods" role="radiogroup" aria-label="Способ оплаты">
          <button type="button" role="radio" aria-checked={method === 'card'} className={method === 'card' ? 'active' : ''} onClick={() => setMethod('card')}>
            <b>Банковская карта</b>
            <span>Visa, Mastercard</span>
          </button>
          <button type="button" role="radio" aria-checked={method === 'club'} className={method === 'club' ? 'active' : ''} onClick={() => setMethod('club')}>
            <b>Клубная карта</b>
            <span>CineScope Club</span>
          </button>
        </div>
        {method === 'card' ? (
          <div className="card-box">
            <label>
              Номер карты
              <input required inputMode="numeric" value={form.number} onChange={set('number')} placeholder="0000 0000 0000 0000" autoComplete="cc-number" />
            </label>
            <div className="row2">
              <label>
                Срок
                <input required inputMode="numeric" value={form.expiry} onChange={set('expiry')} placeholder="ММ/ГГ" autoComplete="cc-exp" />
              </label>
              <label>
                CVC
                <input required inputMode="numeric" value={form.cvc} onChange={set('cvc')} placeholder="123" autoComplete="cc-csc" />
              </label>
            </div>
          </div>
        ) : (
          <div className="card-box club">
            <label>
              Номер клубной карты
              <input required inputMode="numeric" value={form.club} onChange={set('club')} placeholder="10 цифр с обратной стороны карты" />
            </label>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn primary block" disabled={paying}>
          {paying ? 'Проводим оплату…' : `Оплатить ${currency(total)}`}
        </button>
        <p className="muted small">
          Это тестовая оплата, деньги не списываются. Успешная карта: <code>4242 4242 4242 4242</code>, отказ банка:{' '}
          <code>4000 0000 0002 0000</code>. Срок и CVC — любые. Клубная карта — любые 10 цифр.
        </p>
      </form>
    </section>
  )
}
