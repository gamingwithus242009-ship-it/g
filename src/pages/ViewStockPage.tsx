import { useMemo, useState } from 'react'
import { useStock } from '../context/StockContext'
import { groupByBoxThenCategory, sortBoxKeys } from '../lib/groupStock'
import { isLowStock } from '../types'

/** View stock hierarchy — box → category → products. */
export function ViewStockPage() {
  const { products } = useStock()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const grouped = useMemo(
    () => groupByBoxThenCategory(products),
    [products],
  )

  const boxes = useMemo(
    () => sortBoxKeys([...grouped.keys()]),
    [grouped],
  )

  const toggle = (box: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(box)) next.delete(box)
      else next.add(box)
      return next
    })
  }

  if (products.length === 0) {
    return (
      <div className="pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          View Stock
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          No products yet. Add stock from the home screen.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          View Stock
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Box → category → items. Low stock (≤2) is highlighted.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {boxes.map((box) => {
          const catMap = grouped.get(box)!
          const cats = [...catMap.keys()].sort((a, b) => a.localeCompare(b))
          const isCollapsed = collapsed.has(box)
          return (
            <div
              key={box}
              className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-xl backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => toggle(box)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 sm:px-5"
              >
                <span className="text-lg font-bold text-white">
                  Box {box}
                </span>
                <span
                  className={`text-slate-400 transition-transform duration-300 ease-out ${
                    isCollapsed ? '' : 'rotate-180'
                  }`}
                >
                  <IconCaret />
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-4 border-t border-white/10 px-4 pb-4 pt-2 sm:px-5">
                    {cats.map((cat) => (
                      <div key={cat}>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-400/90">
                          {cat}
                        </p>
                        <ul className="space-y-2">
                          {catMap.get(cat)!.map((p) => {
                            const low = isLowStock(p.quantity)
                            return (
                              <li
                                key={p.id}
                                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-shadow duration-300 ${
                                  low
                                    ? 'border-red-300/80 bg-red-50/80 text-red-900 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                                    : 'border-white/10 bg-slate-800/40 text-slate-200'
                                }`}
                              >
                                <span className="font-medium">{p.productName}</span>
                                <span className="flex items-center gap-2 font-semibold tabular-nums">
                                  <span>{p.quantity}</span>
                                  {low ? (
                                    <span className="text-xs font-bold text-red-600">
                                      ⚠ LOW STOCK
                                    </span>
                                  ) : null}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function IconCaret() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
