import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStock } from '../context/StockContext'
import { isClientAdmin } from '../lib/adminClient'
import { ROUTES } from '../routes'

const cardBase =
  'group relative flex w-full items-center gap-4 overflow-hidden rounded-[20px] border border-white/10 bg-slate-900/55 p-4 text-left shadow-[0_8px_32px_rgba(15,118,110,0.12)] backdrop-blur-xl transition-all duration-300 ease-out active:scale-[0.98] sm:p-5'

const glow =
  'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100'

/** Dashboard — navigates to separate route pages. */
export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openWhatsAppShare } = useStock()

  const items: {
    id: string
    title: string
    subtitle: string
    gradient: string
    icon: ReactNode
    onClick: () => void
  }[] = [
    {
      id: 'add',
      title: 'Add Products',
      subtitle: 'Table entry with categories & boxes',
      gradient: 'from-emerald-600 via-teal-500 to-green-400',
      icon: <IconPlus />,
      onClick: () => navigate(ROUTES.add),
    },
    {
      id: 'update',
      title: 'Update Used Products',
      subtitle: 'Subtract usage, auto-remove at zero',
      gradient: 'from-teal-600 via-emerald-500 to-cyan-400',
      icon: <IconRefresh />,
      onClick: () => navigate(ROUTES.update),
    },
    {
      id: 'stock',
      title: 'View Stock',
      subtitle: 'Box → category hierarchy',
      gradient: 'from-green-700 via-emerald-600 to-lime-500',
      icon: <IconBoxes />,
      onClick: () => navigate(ROUTES.stock),
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      subtitle: 'Charts & low-stock focus',
      gradient: 'from-emerald-800 via-green-600 to-teal-500',
      icon: <IconChart />,
      onClick: () => navigate(ROUTES.reports),
    },
    {
      id: 'share',
      title: 'Share on WhatsApp',
      subtitle: 'Formatted stock report in one tap',
      gradient: 'from-lime-600 via-green-500 to-emerald-600',
      icon: <IconWhatsApp />,
      onClick: () => openWhatsAppShare(),
    },
  ]

  return (
    <div className="flex flex-col gap-4 pb-8 pt-2">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400 sm:text-base">
          Premium Herbalife inventory — fast, clear, mobile-first.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={`${cardBase} hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80`}
          >
            <span
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.2]`}
            />
            <span
              className={`${glow} bg-gradient-to-r ${item.gradient} blur-2xl`}
            />
            <span
              className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(52,211,153,0.55)] sm:h-14 sm:w-14`}
            >
              {item.icon}
            </span>
            <span className="relative min-w-0 flex-1">
              <span className="block text-base font-bold text-white sm:text-lg">
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-400 sm:text-sm">
                {item.subtitle}
              </span>
            </span>
            <span className="relative text-slate-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-emerald-400">
              <IconChevron />
            </span>
          </button>
        ))}
      </div>

      {isClientAdmin(user?.email) ? (
        <p className="pt-4 text-center">
          <Link
            to={ROUTES.admin}
            className="text-sm font-semibold text-emerald-400/90 underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-300"
          >
            Admin panel — verify payments
          </Link>
        </p>
      ) : null}
    </div>
  )
}

function IconChevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 0113.657-5.657M20 12a8 8 0 01-13.657 5.657"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 4v6h6M20 20v-6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconBoxes() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 12l9-4.5M12 12v9M12 12L3 7.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17V11M12 17V7M16 17v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.52 3.48A11.84 11.84 0 0012.07 0C5.92 0 1 4.8 1 10.7c0 1.89.5 3.73 1.45 5.35L0 24l8.25-2.16a11.7 11.7 0 005.8 1.56h.01c6.15 0 11.07-4.8 11.07-10.7 0-2.86-1.19-5.55-3.35-7.56l.74.34zM12.08 21.3h-.01a9.6 9.6 0 01-4.9-1.34l-.35-.2-4.55 1.19 1.22-4.42-.23-.37a9.58 9.58 0 01-1.46-5.1c0-5.3 4.32-9.6 9.63-9.6 2.57 0 4.99.99 6.81 2.8a9.56 9.56 0 012.82 6.8c0 5.3-4.32 9.6-9.64 9.6zm5.54-7.72c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.08 2.9 1.23 3.1.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.25-.2-.55-.35z" />
    </svg>
  )
}
