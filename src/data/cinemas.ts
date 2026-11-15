import type { Cinema } from '../types'

// Вымышленная сеть кинотеатров в Баку
export const cinemas: Cinema[] = [
  {
    id: 'park',
    name: 'CineScope Park',
    mall: 'ТЦ Park Avenue',
    address: 'пр. Нефтяников, 1',
    metro: 'Сахил',
    phone: '+994 12 000 00 01',
    palette: ['#e31b23', '#f79e1b'],
  },
  {
    id: 'seaside',
    name: 'CineScope Seaside',
    mall: 'ТЦ Seaside',
    address: 'Приморский бульвар, 12',
    metro: 'Ичеришехер',
    phone: '+994 12 000 00 02',
    palette: ['#1b6fe3', '#1bd3f7'],
  },
  {
    id: 'north',
    name: 'CineScope North',
    mall: 'ТЦ North Point',
    address: 'ул. Ататюрка, 45',
    metro: 'Гянджлик',
    phone: '+994 12 000 00 03',
    palette: ['#7a1be3', '#f71bb5'],
  },
]

export const getCinemaById = (id: string) => cinemas.find((c) => c.id === id)
