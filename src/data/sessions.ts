import type { Language, Session } from '../types'
import { movies } from './movies'
import { halls } from './halls'
import { dateKey } from '../lib/format'
import { hashString, seeded } from '../lib/random'

const BASE_PRICES = {
  '2D': { standard: 8, vip: 14, sofa: 22 },
  '3D': { standard: 10, vip: 16, sofa: 26 },
  'Dolby Atmos': { standard: 12, vip: 18, sofa: 30 },
  IMAX: { standard: 15, vip: 22, sofa: 36 },
} as const

const SLOTS = ['10:20', '12:40', '15:10', '17:30', '19:50', '22:15']
const LANGS: Language[] = ['AZ', 'AZ', 'RU', 'RU', 'EN', 'TR']

/** Генерирует расписание всех кинотеатров на 7 дней вперёд (детерминированно по дате). */
export function buildSchedule(days = 7): Session[] {
  const out: Session[] = []
  const now = new Date()
  const showing = movies.filter((m) => m.status === 'now')
  for (let d = 0; d < days; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d)
    const key = dateKey(day)
    halls.forEach((hall, hi) => {
      const rnd = seeded(hashString(key + hall.id))
      SLOTS.forEach((slot, si) => {
        const movie = showing[Math.floor(rnd() * showing.length + hi + si) % showing.length]
        const [h, m] = slot.split(':').map(Number)
        const startsAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m + (hi % 4) * 5)
        const format = hall.format === '2D' && rnd() > 0.5 ? '3D' : hall.format
        const evening = h >= 18 ? 1.2 : 1
        const base = BASE_PRICES[format]
        const language = LANGS[Math.floor(rnd() * LANGS.length)]
        out.push({
          id: `${key}_${hall.id}_${slot.replace(':', '')}`,
          movieId: movie.id,
          cinemaId: hall.cinemaId,
          hallId: hall.id,
          startsAt: startsAt.toISOString(),
          format,
          language,
          subtitles: language === 'EN' || language === 'TR' ? 'AZ' : undefined,
          prices: {
            standard: Math.round(base.standard * evening),
            vip: Math.round(base.vip * evening),
            sofa: Math.round(base.sofa * evening),
          },
        })
      })
    })
  }
  return out.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}
