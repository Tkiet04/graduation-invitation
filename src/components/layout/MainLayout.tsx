import { Outlet, Link, useLocation, useSearchParams } from 'react-router-dom'
import '@/styles/layout.css'

/** Chỉ người tạo thiệp (?created=1 | ?share=1) mới thấy action quản lý */
function useIsCreatorView() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const onInvite = pathname.startsWith('/i/')
  if (!onInvite) return true // trang tạo thiệp = creator
  return params.get('created') === '1' || params.get('share') === '1'
}

export function MainLayout() {
  const { pathname } = useLocation()
  const isCreator = useIsCreatorView()
  const isGuestInvite = pathname.startsWith('/i/') && !isCreator

  return (
    <div className={`layout${isGuestInvite ? ' layout--guest' : ''}`}>
      {!isGuestInvite && (
        <header className="layout__header">
          <Link to="/" className="layout__brand">
            Thư mời
          </Link>
          <Link className="btn btn--ghost layout__create" to="/">
            Tạo mới
          </Link>
        </header>
      )}

      <main className="layout__main">
        <Outlet />
      </main>

      {!isGuestInvite && (
        <footer className="layout__footer">
          Thư mời lễ tốt nghiệp · mỗi người nhận một mã QR riêng
        </footer>
      )}
    </div>
  )
}
