import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { MoviePage } from './pages/MoviePage'
import { SoonPage } from './pages/SoonPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderPage } from './pages/OrderPage'
import { TicketsPage } from './pages/TicketsPage'
import { NotFound } from './pages/NotFound'
import { SchedulePage } from './pages/SchedulePage'
import { CinemasPage } from './pages/CinemasPage'
import { PromoPage } from './pages/PromoPage'

// Three.js тяжёлый — грузим схему зала отдельным чанком
const SeatsPage = lazy(() => import('./pages/SeatsPage'))

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="soon" element={<SoonPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="cinemas" element={<CinemasPage />} />
          <Route path="promo" element={<PromoPage />} />
          <Route path="movie/:id" element={<MoviePage />} />
          <Route
            path="session/:id"
            element={
              <Suspense fallback={<div className="loader">Загружаем зал…</div>}>
                <SeatsPage />
              </Suspense>
            }
          />
          <Route path="checkout/:id" element={<CheckoutPage />} />
          <Route path="order/:id" element={<OrderPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
