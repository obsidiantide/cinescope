import { useSearchParams } from 'react-router-dom'
import { dateKey } from './format'
import type { Language } from '../types'

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'AZ', label: 'Азербайджанский' },
  { id: 'RU', label: 'Русский' },
  { id: 'EN', label: 'Английский' },
  { id: 'TR', label: 'Турецкий' },
]

/** Фильтры афиши живут в URL (?date=&cinema=&lang=), поэтому ссылками можно делиться. */
export function useFilters() {
  const [params, setParams] = useSearchParams()
  const date = params.get('date') || dateKey(new Date())
  const cinemaId = params.get('cinema') || undefined
  const language = (params.get('lang') as Language | null) || undefined
  const set = (k: 'date' | 'cinema' | 'lang', v: string | undefined) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }
  return { date, cinemaId, language, set, query: params.toString() }
}
