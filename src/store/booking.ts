import { create } from 'zustand'

export const MAX_SEATS = 8

interface BookingState {
  sessionId: string | null
  selected: string[]
  hovered: string | null
  focusSeat: string | null
  start: (sessionId: string) => void
  toggle: (seatId: string) => void
  remove: (seatId: string) => void
  clear: () => void
  setHovered: (id: string | null) => void
  setFocusSeat: (id: string | null) => void
}

export const useBooking = create<BookingState>((set, get) => ({
  sessionId: null,
  selected: [],
  hovered: null,
  focusSeat: null,
  start: (sessionId) => {
    if (get().sessionId !== sessionId) set({ sessionId, selected: [], hovered: null, focusSeat: null })
  },
  toggle: (id) =>
    set((s) => {
      if (s.selected.includes(id)) return { selected: s.selected.filter((x) => x !== id), focusSeat: s.focusSeat === id ? null : s.focusSeat }
      if (s.selected.length >= MAX_SEATS) return s
      return { selected: [...s.selected, id] }
    }),
  remove: (id) => set((s) => ({ selected: s.selected.filter((x) => x !== id), focusSeat: s.focusSeat === id ? null : s.focusSeat })),
  clear: () => set({ selected: [], focusSeat: null }),
  setHovered: (hovered) => set({ hovered }),
  setFocusSeat: (focusSeat) => set({ focusSeat }),
}))
