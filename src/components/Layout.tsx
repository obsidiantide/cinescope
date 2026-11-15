import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { cinemas } from '../data/cinemas'
import { LogoMark } from './Logo'

const NAV = [
  { to: '/', label: 'Афиша', end: true },
  { to: '/schedule', label: 'Расписание' },
  { to: '/soon', label: 'Скоро' },
  { to: '/cinemas', label: 'Кинотеатры' },
  { to: '/promo', label: 'Акции' },
]

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="app">
      <div className="topline">
        <div className="wrap">
          <span>Колл-центр: <a href="tel:+994120000000">+994 12 000 00 00</a></span>
          <span className="topline-right">
            <span className="hide-sm">Ежедневно 10:00 – 02:00</span>
            <Link to="/tickets">Мои билеты</Link>
          </span>
        </div>
      </div>
      <header className="topbar">
        <div className="wrap">
          <Link to="/" className="brand" aria-label="CineScope — на главную">
            <LogoMark />
            <span className="logo-text">
              Cine<b>Scope</b>
            </span>
          </Link>
          <nav>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/schedule" className="btn primary small buy-cta">
            Купить билет
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            <Link to="/" className="brand light">
              <LogoMark />
              <span className="logo-text">
                Cine<b>Scope</b>
              </span>
            </Link>
            <p className="muted small">Сеть кинотеатров с IMAX, Dolby Atmos и залами Lounge. Демо-проект, оплата тестовая.</p>
          </div>
          <div>
            <h4>Зрителям</h4>
            <Link to="/">Афиша</Link>
            <Link to="/schedule">Расписание</Link>
            <Link to="/soon">Скоро в кино</Link>
            <Link to="/tickets">Мои билеты и возврат</Link>
          </div>
          <div>
            <h4>Кинотеатры</h4>
            {cinemas.map((c) => (
              <Link key={c.id} to={`/schedule?cinema=${c.id}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div>
            <h4>Контакты</h4>
            <a href="tel:+994120000000">+994 12 000 00 00</a>
            <span className="muted small">Баку, пр. Нефтяников, 1</span>
            <Link to="/promo">Акции и спецпредложения</Link>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} CineScope</span>
          <span>Демо-проект: фильмы вымышленные, деньги не списываются</span>
        </div>
      </footer>
    </div>
  )
}
