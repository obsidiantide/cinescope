export const currency = (v: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(v) + ' ₼'

export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

export const dayLabel = (d: Date) => {
  const today = new Date()
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((t1 - t0) / 86400000)
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Завтра'
  return d.toLocaleDateString('ru-RU', { weekday: 'short' })
}

export const dateShort = (d: Date) =>
  d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

export const dateLong = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

export const duration = (min: number) => `${Math.floor(min / 60)} ч ${min % 60} мин`

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const seatTypeLabel: Record<string, string> = {
  standard: 'Стандарт',
  vip: 'VIP-кресло',
  sofa: 'Диван на двоих',
}

export function plural(n: number) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'билет'
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'билета'
  return 'билетов'
}
