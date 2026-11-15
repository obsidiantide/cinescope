import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOccupiedSeats, getSession } from '../api'
import { useAsync } from '../lib/useAsync'
import { useBooking, MAX_SEATS } from '../store/booking'
import HallScene, { type CameraView } from '../three/HallScene'
import { SEAT_COLORS, SELECTED_COLOR, OCCUPIED_COLOR } from '../three/Seat'
import { hallSeats } from '../data/halls'
import { currency, dateLong, plural, seatTypeLabel, time } from '../lib/format'
import { NotFound } from './NotFound'
import type { SeatType } from '../types'

const VIEWS: { id: CameraView; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'top', label: 'Сверху' },
  { id: 'screen', label: 'От экрана' },
]

export default function SeatsPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const data = useAsync(() => getSession(id), [id])
  const occ = useAsync(() => getOccupiedSeats(id), [id])
  const [view, setView] = useState<CameraView>('overview')
  const { selected, focusSeat, start, remove, clear, setFocusSeat } = useBooking()

  useEffect(() => {
    start(id)
  }, [id, start])
  useEffect(() => () => setFocusSeat(null), [setFocusSeat])

  const seatsById = useMemo(() => new Map(data.data ? hallSeats(data.data.hall).map((s) => [s.id, s]) : []), [data.data])

  if (data.loading && !data.data) return <div className="loader">Загружаем зал…</div>
  if (!data.data) return <NotFound text="Сеанс не найден" />
  const { session, movie, hall, cinema } = data.data
  const occupied = occ.data ?? new Set<string>()
  const total = selected.reduce((sum, sid) => sum + session.prices[seatsById.get(sid)!.type], 0)
  const free = seatsById.size - occupied.size
  const types = [...new Set(hall.rows.map((r) => r.type))] as SeatType[]

  return (
    <div className="seats-page">
      <div className="seats-head container">
        <Link to={`/movie/${movie.id}`} className="back">
          ← {movie.title}
        </Link>
        <div className="seats-meta">
          <b>
            {dateLong(session.startsAt)}, {time(session.startsAt)}
          </b>
          <span>
            {cinema.name} · {hall.name}
            {hall.format !== session.format ? ` · ${session.format}` : ''} · {session.language} · {movie.ageRating}
          </span>
        </div>
      </div>

      <div className="seats-layout">
        <div className="stage">
          {occ.data ? (
            <HallScene hall={hall} movie={movie} session={session} occupied={occupied} view={view} />
          ) : (
            <div className="loader">Проверяем свободные места…</div>
          )}
          <div className="stage-toolbar">
            {focusSeat ? (
              <>
                <span className="pill">
                  Ряд {seatsById.get(focusSeat)?.row}, место {seatsById.get(focusSeat)?.number} · так вы увидите экран, тяните, чтобы осмотреться
                </span>
                <button className="btn small" onClick={() => setFocusSeat(null)}>
                  ← Вернуться к залу
                </button>
              </>
            ) : (
              VIEWS.map((v) => (
                <button key={v.id} className={view === v.id ? 'btn small active' : 'btn small'} onClick={() => setView(v.id)}>
                  {v.label}
                </button>
              ))
            )}
          </div>
          <div className="stage-hint">
            Клик по месту — выбрать и посмотреть вид на экран · тяните — вращение · колесо — масштаб
          </div>
        </div>

        <aside className="seats-side">
          <div className="legend">
            {types.map((t) => (
              <span key={t}>
                <i style={{ background: SEAT_COLORS[t] }} /> {seatTypeLabel[t]} · {currency(session.prices[t])}
              </span>
            ))}
            <span>
              <i style={{ background: SELECTED_COLOR }} /> Ваш выбор
            </span>
            <span>
              <i style={{ background: OCCUPIED_COLOR }} /> Занято
            </span>
          </div>
          <p className="muted small">
            Свободно {free} из {seatsById.size} мест · до {MAX_SEATS} билетов в заказе
          </p>

          <h3>Выбранные места</h3>
          {selected.length === 0 ? (
            <p className="muted">Нажмите на свободное кресло в зале, чтобы выбрать его.</p>
          ) : (
            <ul className="picked">
              {selected.map((sid) => {
                const s = seatsById.get(sid)!
                return (
                  <li key={sid} className={focusSeat === sid ? 'focused' : ''}>
                    <div>
                      <b>
                        Ряд {s.row}, место {s.number}
                      </b>
                      <span>{seatTypeLabel[s.type]}</span>
                    </div>
                    <em>{currency(session.prices[s.type])}</em>
                    <button title="Посмотреть вид с этого места" onClick={() => setFocusSeat(focusSeat === sid ? null : sid)}>
                      👁
                    </button>
                    <button title="Убрать" onClick={() => remove(sid)}>
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="total">
            <span>Итого</span>
            <b>{currency(total)}</b>
          </div>
          <button className="btn primary block" disabled={!selected.length} onClick={() => nav(`/checkout/${session.id}`)}>
            {selected.length ? `Купить ${selected.length} ${plural(selected.length)}` : 'Выберите места'}
          </button>
          {selected.length > 0 && (
            <button className="btn ghost block" onClick={clear}>
              Сбросить выбор
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}

