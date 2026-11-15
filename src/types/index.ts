export type Genre =
  | 'Драма'
  | 'Фантастика'
  | 'Триллер'
  | 'Анимация'
  | 'Ужасы'
  | 'Боевик'
  | 'Комедия'
  | 'Фэнтези'
  | 'Приключения'

export interface Movie {
  id: string
  title: string
  originalTitle?: string
  tagline: string
  description: string
  genres: Genre[]
  durationMin: number
  ageRating: '0+' | '6+' | '12+' | '16+' | '18+'
  year: number
  country: string
  director: string
  cast: string[]
  rating: number
  /** Цвета для генеративного постера */
  palette: [string, string, string]
  motif: 'sun' | 'rings' | 'grid' | 'waves' | 'eye' | 'road' | 'stars' | 'tower'
  status: 'now' | 'soon'
  releaseDate?: string
  /** Метка «NEW» на карточке — премьера последних недель */
  isNew?: boolean
}

export type Language = 'AZ' | 'RU' | 'EN' | 'TR'
export type Format = '2D' | '3D' | 'IMAX' | 'Dolby Atmos'

export interface Cinema {
  id: string
  name: string
  mall: string
  address: string
  metro: string
  phone: string
  palette: [string, string]
}

export type SeatType = 'standard' | 'vip' | 'sofa'

export interface RowLayout {
  label: string
  type: SeatType
  /** Количество мест в ряду (для sofa — диванов на двоих) */
  seats: number
  /** Индексы (с 0), после которых в ряду проход */
  aisles?: number[]
}

export interface Hall {
  id: string
  cinemaId: string
  name: string
  format: Format
  rows: RowLayout[]
}

export interface Session {
  id: string
  movieId: string
  cinemaId: string
  hallId: string
  startsAt: string // ISO
  format: Format
  language: Language
  subtitles?: Language
  prices: Record<SeatType, number>
}

export interface Seat {
  id: string // "A-5"
  row: string
  number: number
  type: SeatType
  rowIndex: number
  indexInRow: number
}

export interface Ticket {
  seatId: string
  row: string
  number: number
  type: SeatType
  price: number
}

export interface Order {
  id: string
  sessionId: string
  movieId: string
  createdAt: string
  email: string
  name: string
  phone?: string
  method?: 'card' | 'club'
  tickets: Ticket[]
  total: number
  cardLast4: string
  status: 'paid' | 'refunded'
}
