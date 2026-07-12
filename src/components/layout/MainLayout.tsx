import { Outlet, Link } from 'react-router-dom'
import '@/styles/layout.css'

export function MainLayout() {
  return (
    <div className="layout">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '1rem 1.25rem 0',
          width: '100%',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-script)',
            fontSize: '1.75rem',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Thư mời
        </Link>
        <Link className="btn btn--ghost" to="/" style={{ textDecoration: 'none' }}>
          Tạo mới
        </Link>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="layout__footer">
        Thư mời lễ tốt nghiệp · mỗi người nhận một mã QR riêng
      </footer>
    </div>
  )
}
