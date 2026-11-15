import type { Hall, Seat } from '../types'

const std = (label: string, seats: number, aisles = [3, seats - 5]) => ({
  label,
  type: 'standard' as const,
  seats,
  aisles,
})

export const halls: Hall[] = [
  {
    id: 'imax',
    name: 'Зал 1 · IMAX',
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
  {
    id: 'atmos',
    name: 'Зал 2 · Dolby Atmos',
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
  {
    id: 'small',
    name: 'Зал 3 · Камерный',
    format: '2D',
    rows: [
      std('A', 10, [4]),
      std('B', 10, [4]),
      std('C', 12, [5]),
      std('D', 12, [5]),
      { label: 'E', type: 'sofa', seats: 5, aisles: [1, 2] },
    ],
  },
]

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
