import type { Hall, Seat, SeatType } from '../types'
import { hallSeats } from '../data/halls'

export const ROW_DEPTH = 1.2
export const ROW_RISE = 0.32
const AISLE = 0.85
const GAP = 0.07
const CURVE = 0.009

export const SEAT_WIDTH: Record<SeatType, number> = { standard: 0.66, vip: 0.92, sofa: 1.5 }

export interface PlacedSeat extends Seat {
  position: [number, number, number]
  rotationY: number
  width: number
}

export interface HallLayout {
  seats: PlacedSeat[]
  byId: Map<string, PlacedSeat>
  rows: { label: string; y: number; z: number; left: number; right: number; type: SeatType }[]
  width: number
  depth: number
  screen: { z: number; y: number; width: number; height: number }
  center: [number, number, number]
}

/** Раскладывает ряды амфитеатром: каждый следующий ряд выше, края рядов слегка загнуты к экрану. */
export function computeLayout(hall: Hall): HallLayout {
  const seats = hallSeats(hall)
  const rowWidths = hall.rows.map((r) => {
    const w = SEAT_WIDTH[r.type]
    return r.seats * w + (r.seats - 1) * GAP + (r.aisles?.length ?? 0) * AISLE
  })
  const maxW = Math.max(...rowWidths)
  const screenWidth = Math.min(maxW * 1.1, 17)
  const screenHeight = screenWidth / (hall.format === 'IMAX' ? 1.9 : 2.3)
  const firstRowZ = 0
  const screenZ = -Math.max(6.5, screenWidth * 0.55)
  const focusZ = screenZ - 10

  const placed: PlacedSeat[] = []
  const rows: HallLayout['rows'] = []
  hall.rows.forEach((row, ri) => {
    const w = SEAT_WIDTH[row.type]
    let x = -rowWidths[ri] / 2
    const y = ri * ROW_RISE
    const zRow = firstRowZ + ri * ROW_DEPTH
    let left = Infinity
    let right = -Infinity
    for (let i = 0; i < row.seats; i++) {
      const cx = x + w / 2
      const cz = zRow - CURVE * cx * cx
      const rotationY = Math.atan2(cx, cz - focusZ)
      const seat = seats.find((s) => s.rowIndex === ri && s.indexInRow === i)!
      placed.push({ ...seat, position: [cx, y, cz], rotationY, width: w })
      left = Math.min(left, cx - w / 2)
      right = Math.max(right, cx + w / 2)
      x += w + GAP
      if (row.aisles?.includes(i)) x += AISLE
    }
    rows.push({ label: row.label, y, z: zRow, left, right, type: row.type })
  })

  const depth = (hall.rows.length - 1) * ROW_DEPTH
  return {
    seats: placed,
    byId: new Map(placed.map((s) => [s.id, s])),
    rows,
    width: maxW + 3,
    depth,
    screen: { z: screenZ, y: screenHeight / 2 + 1.1, width: screenWidth, height: screenHeight },
    center: [0, (hall.rows.length * ROW_RISE) / 2, depth / 2],
  }
}
