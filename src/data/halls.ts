import type { Hall, Seat } from '../types'

const std = (label: string, seats: number, aisles = [3, seats - 5]) => ({
  label,
  type: 'standard' as const,
  seats,
  aisles,
})

type HallTemplate = Omit<Hall, 'id' | 'cinemaId' | 'name'> & { key: string; title: string }

const templates: Record<string, HallTemplate> = {
  imax: {
    key: 'imax',
    title: 'IMAX',
    format: 'IMAX',
    rows: [
      std('A', 14),
      std('B', 16),
      std('C', 16),
      std('D', 18),
      std('E', 18),
      std('F', 18),
      { label: 'G', type: 'vip', seats: 14, aisles: [2, 10] },
      { label: 'H', type: 'vip', seats: 14, aisles: [2, 10] },
      { label: 'J', type: 'sofa', seats: 7, aisles: [1, 4] },
    ],
  },
  atmos: {
    key: 'atmos',
    title: 'Dolby Atmos',
    format: 'Dolby Atmos',
    rows: [
      std('A', 12),
      std('B', 14),
      std('C', 14),
      std('D', 14),
      std('E', 16),
      { label: 'F', type: 'vip', seats: 12, aisles: [2, 8] },
      { label: 'G', type: 'sofa', seats: 6, aisles: [0, 4] },
    ],
  },
  classic: {
    key: 'classic',
    title: 'Classic',
    format: '2D',
    rows: [
      std('A', 12, [3, 7]),
      std('B', 14),
      std('C', 14),
      std('D', 14),
      std('E', 14),
      { label: 'F', type: 'sofa', seats: 6, aisles: [0, 4] },
    ],
  },
  lounge: {
    key: 'lounge',
    title: 'Lounge',
    format: '2D',
    rows: [
      { label: 'A', type: 'vip', seats: 8, aisles: [3] },
      { label: 'B', type: 'vip', seats: 8, aisles: [3] },
      { label: 'C', type: 'vip', seats: 10, aisles: [4] },
      { label: 'D', type: 'sofa', seats: 5, aisles: [1, 2] },
    ],
  },
}

const CINEMA_HALLS: Record<string, string[]> = {
  park: ['imax', 'atmos', 'classic', 'lounge'],
  seaside: ['atmos', 'classic', 'lounge'],
  north: ['imax', 'classic'],
}

export const halls: Hall[] = Object.entries(CINEMA_HALLS).flatMap(([cinemaId, keys]) =>
  keys.map((k, i) => {
    const t = templates[k]
    return { id: `${cinemaId}-${k}`, cinemaId, name: `Зал ${i + 1} · ${t.title}`, format: t.format, rows: t.rows }
  }),
)

export const getHallById = (id: string) => halls.find((h) => h.id === id)

export function hallSeats(hall: Hall): Seat[] {
  const out: Seat[] = []
  hall.rows.forEach((row, rowIndex) => {
    for (let i = 0; i < row.seats; i++) {
      out.push({
        id: `${row.label}-${i + 1}`,
        row: row.label,
        number: i + 1,
        type: row.type,
        rowIndex,
        indexInRow: i,
      })
    }
  })
  return out
}
