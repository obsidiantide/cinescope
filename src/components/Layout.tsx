import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <span>
            Cine<b>Scope</b>
          </span>
        </Link>
        <nav>
          <NavLink to="/" end>
            Афиша
          </NavLink>
          <NavLink to="/soon">Скоро</NavLink>
          <NavLink to="/tickets">Мои билеты</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <span>CineScope · демо-проект, оплата тестовая</span>
        <span>Баку, пр. Нефтяников, 1 · +994 12 000 00 00</span>
      </footer>
    </div>
  )
}
