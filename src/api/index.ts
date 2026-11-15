/**
 * Мок-API. Все функции асинхронные и возвращают те же формы данных, что вернул бы
 * настоящий бэкенд, — чтобы позже заменить реализацию на fetch() без правок в UI.
 */
import type { Hall, Movie, Order, Session, Ticket } from '../types'
import { movies, getMovieById } from '../data/movies'
import { getHallById, hallSeats } from '../data/halls'
import { buildSchedule } from '../data/sessions'
import { hashString, seeded } from '../lib/random'

const ORDERS_KEY = 'cinescope.orders.v1'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

let schedule: Session[] | null = null
const getSchedule = () => (schedule ??= buildSchedule())

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
  } catch {
    return []
  }
}
function writeOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  } catch {
    /* приватный режим — заказ останется только в памяти */
  }
}

export async function listMovies(status?: Movie['status']): Promise<Movie[]> {
  await delay(150)
  return status ? movies.filter((m) => m.status === status) : movies
}

export async function getMovie(id: string): Promise<Movie | undefined> {
  await delay(100)
  return getMovieById(id)
}

export async function listSessions(filter: { movieId?: string; date?: string } = {}): Promise<Session[]> {
  await delay(150)
  const now = Date.now() - 15 * 60 * 1000 // продажа закрывается через 15 мин после начала
  return getSchedule().filter(
    (s) =>
      new Date(s.startsAt).getTime() > now &&
      (!filter.movieId || s.movieId === filter.movieId) &&
      (!filter.date || s.id.startsWith(filter.date)),
  )
}

export async function getSession(
  id: string,
): Promise<{ session: Session; movie: Movie; hall: Hall } | undefined> {
  await delay(120)
  const session = getSchedule().find((s) => s.id === id)
  if (!session) return undefined
  const movie = getMovieById(session.movieId)!
  const hall = getHallById(session.hallId)!
  return { session, movie, hall }
}

/** Занятые места: детерминированная «толпа» + реально купленные в этом браузере билеты. */
export async function getOccupiedSeats(sessionId: string): Promise<Set<string>> {
  await delay(200)
  const session = getSchedule().find((s) => s.id === sessionId)
  if (!session) return new Set()
  const hall = getHallById(session.hallId)!
  const rnd = seeded(hashString(sessionId))
  const hour = new Date(session.startsAt).getHours()
  const load = hour >= 19 ? 0.55 : hour >= 15 ? 0.35 : 0.18
  const taken = new Set<string>()
  const seats = hallSeats(hall)
  // Группы зрителей: 1–4 соседних места подряд
  for (const seat of seats) {
    if (taken.has(seat.id) || rnd() > load / 2.2) continue
    const group = 1 + Math.floor(rnd() * 4)
    for (let k = 0; k < group; k++) {
      const n = seat.number + k
      if (n > hall.rows[seat.rowIndex].seats) break
      taken.add(`${seat.row}-${n}`)
    }
  }
  for (const o of readOrders()) {
    if (o.sessionId === sessionId && o.status === 'paid') o.tickets.forEach((t) => taken.add(t.seatId))
  }
  return taken
}

export interface PaymentInput {
  sessionId: string
  seatIds: string[]
  name: string
  email: string
  card: { number: string; expiry: string; cvc: string }
}

export class PaymentError extends Error {}

/** Мок-оплата: проверяет карту по алгоритму Луна и «отклоняет» карты, заканчивающиеся на 0000. */
export async function purchase(input: PaymentInput): Promise<Order> {
  await delay(1400)
  const data = await getSession(input.sessionId)
  if (!data) throw new PaymentError('Сеанс не найден')
  const occupied = await getOccupiedSeats(input.sessionId)
  const conflict = input.seatIds.find((id) => occupied.has(id))
  if (conflict) throw new PaymentError(`Место ${conflict} уже занято — выберите другое`)
  const digits = input.card.number.replace(/\D/g, '')
  if (!luhn(digits)) throw new PaymentError('Неверный номер карты')
  if (digits.endsWith('0000')) throw new PaymentError('Банк отклонил платёж (тестовая карта с отказом)')

  const byId = new Map(hallSeats(data.hall).map((s) => [s.id, s]))
  const tickets: Ticket[] = input.seatIds.map((id) => {
    const s = byId.get(id)!
    return { seatId: id, row: s.row, number: s.number, type: s.type, price: data.session.prices[s.type] }
  })
  const order: Order = {
    id: 'CS-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    sessionId: input.sessionId,
    movieId: data.movie.id,
    createdAt: new Date().toISOString(),
    email: input.email,
    name: input.name,
    tickets,
    total: tickets.reduce((a, t) => a + t.price, 0),
    cardLast4: digits.slice(-4),
    status: 'paid',
  }
  writeOrders([order, ...readOrders()])
  return order
}

export async function listOrders(): Promise<Order[]> {
  await delay(100)
  return readOrders()
}

export async function getOrder(id: string): Promise<Order | undefined> {
  await delay(100)
  return readOrders().find((o) => o.id === id)
}

export async function refundOrder(id: string): Promise<void> {
  await delay(400)
  writeOrders(readOrders().map((o) => (o.id === id ? { ...o, status: 'refunded' } : o)))
}

export function luhn(digits: string): boolean {
  if (digits.length < 12) return false
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}
