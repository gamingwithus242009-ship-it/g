import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { StockProvider } from './context/StockContext'
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext'
import { ROUTES } from './routes'
import { firebaseReady } from './firebase/client'
import { ConfigRequiredPage } from './pages/ConfigRequiredPage'
import { LoginPage } from './pages/LoginPage'
import { SubscribePage } from './pages/SubscribePage'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { AddProductsPage } from './pages/AddProductsPage'
import { UpdateUsedPage } from './pages/UpdateUsedPage'
import { ViewStockPage } from './pages/ViewStockPage'

const ReportsPage = lazy(async () => {
  const m = await import('./pages/ReportsPage')
  return { default: m.ReportsPage }
})

function FullScreenLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  )
}

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullScreenLoading />
  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }
  return <Outlet />
}

function RequireSubscribed() {
  const { loading, active } = useSubscription()
  const location = useLocation()
  if (loading) return <FullScreenLoading />
  if (!active) {
    return <Navigate to={ROUTES.subscribe} replace state={{ from: location }} />
  }
  return <Outlet />
}

function titleForPath(pathname: string): string {
  switch (pathname) {
    case ROUTES.add:
      return 'Add Products'
    case ROUTES.update:
      return 'Update Used'
    case ROUTES.stock:
      return 'View Stock'
    case ROUTES.reports:
      return 'Reports'
    default:
      return ''
  }
}

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOutUser } = useAuth()
  const { remainingDays, subscription } = useSubscription()
  const isHome = location.pathname === ROUTES.home
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const goBack = () => {
    navigate(ROUTES.home)
  }

  const expiryShort = subscription?.expiryDate?.toDate?.()?.toLocaleDateString?.() ?? '—'

  return (
    <div className="app-root min-h-[100dvh]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 sm:max-w-2xl sm:px-6">
          {isHome ? (
            <Link
              to={ROUTES.home}
              className="group flex min-w-0 flex-1 items-center gap-2 text-left transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-500 to-green-400 text-xs font-black text-white shadow-lg shadow-emerald-500/30">
                H
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold tracking-tight text-white sm:text-base">
                  Herbalife Stock
                </span>
                <span className="block truncate text-[11px] font-medium text-emerald-400/80 sm:text-xs">
                  Manager
                </span>
              </span>
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={goBack}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-semibold text-emerald-100 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-emerald-500/30 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 active:scale-[0.98]"
                aria-label="Back to dashboard"
              >
                <IconBackArrow />
                Back
              </button>
              <h1 className="min-w-0 flex-1 truncate text-center text-sm font-bold tracking-tight text-white sm:text-base">
                {titleForPath(location.pathname)}
              </h1>
              <span className="w-[72px] shrink-0 sm:w-[88px]" aria-hidden />
            </>
          )}

          <div
            className="relative shrink-0"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/90 py-1.5 pl-1.5 pr-2 text-left transition hover:border-emerald-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-8 w-8 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/40 text-xs font-bold text-white">
                  {(user?.displayName || user?.email || '?').slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="hidden max-w-[100px] truncate text-xs font-medium text-slate-300 sm:block">
                {user?.displayName || 'Account'}
              </span>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/95 py-2 shadow-xl backdrop-blur-xl">
                <div className="border-b border-white/10 px-3 pb-2 pt-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
                <div className="px-3 py-2 text-xs text-slate-400">
                  <p>
                    <span className="text-slate-500">Subscription:</span>{' '}
                    <span className="font-medium text-emerald-400">Active</span>
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500">Renews / expires:</span>{' '}
                    <span className="text-slate-200">{expiryShort}</span>
                  </p>
                  <p className="mt-1">
                    <span className="text-slate-500">Days left:</span>{' '}
                    <span className="font-semibold text-white">{remainingDays}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 w-full px-3 py-2 text-left text-sm font-medium text-red-300 transition hover:bg-red-950/50"
                  onClick={() => {
                    setMenuOpen(false)
                    void signOutUser()
                  }}
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-10 pt-4 sm:max-w-2xl sm:px-6 sm:pt-6">
        <Outlet />
      </main>
    </div>
  )
}

function IconBackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SubscribedRoutes() {
  return (
    <StockProvider>
      <AppLayout />
    </StockProvider>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path={ROUTES.admin} element={<AdminPage />} />
        <Route path={ROUTES.subscribe} element={<SubscribePage />} />
        <Route element={<RequireSubscribed />}>
          <Route element={<SubscribedRoutes />}>
            <Route index element={<HomePage />} />
            <Route path="add" element={<AddProductsPage />} />
            <Route path="update" element={<UpdateUsedPage />} />
            <Route path="stock" element={<ViewStockPage />} />
            <Route
              path="reports"
              element={
                <Suspense
                  fallback={
                    <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-10 text-center text-sm text-slate-400 backdrop-blur-xl">
                      Loading analytics…
                    </div>
                  }
                >
                  <ReportsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}

export default function App() {
  if (!firebaseReady) {
    return <ConfigRequiredPage />
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <AppRoutes />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
