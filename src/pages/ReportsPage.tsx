import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStock } from '../context/StockContext'
import {
  boxTotals,
  categoryTotals,
  groupByBoxThenCategory,
  sortBoxKeys,
} from '../lib/groupStock'
import type { Product } from '../types'
import { isLowStock } from '../types'

const chartColors = {
  grid: 'rgba(148,163,184,0.15)',
  axis: 'rgba(203,213,225,0.85)',
  barCat: '#059669',
  barBox: '#0d9488',
}

/** Reports & analytics — charts, low-stock, text report (logic here). */
export function ReportsPage() {
  const { products } = useStock()

  const catData = useMemo(
    () => categoryTotals(products).map((c) => ({ name: c.name, total: c.total })),
    [products],
  )

  const boxData = useMemo(
    () => boxTotals(products).map((b) => ({ name: b.name, total: b.total })),
    [products],
  )

  const critical = useMemo(
    () =>
      [...products]
        .filter((p) => isLowStock(p.quantity))
        .sort((a, b) => a.productName.localeCompare(b.productName)),
    [products],
  )

  const hasData = products.length > 0

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Category and box distribution with low-stock emphasis.
        </p>
      </div>

      <section className="glass-panel rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/90">
          Category-wise stock
        </h2>
        <div className="mt-4 h-64 w-full sm:h-72">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: chartColors.axis, fontSize: 11 }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={64}
                />
                <YAxis tick={{ fill: chartColors.axis, fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(16,185,129,0.12)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(16,185,129,0.35)',
                    background: 'rgba(15,23,42,0.95)',
                    color: '#e2e8f0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Units"
                  fill={chartColors.barCat}
                  radius={[8, 8, 0, 0]}
                  animationDuration={450}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </section>

      <section className="glass-panel rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/90">
          Box-wise distribution
        </h2>
        <div className="mt-4 h-64 w-full sm:h-72">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={boxData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={(v) => `Box ${v}`}
                  tick={{ fill: chartColors.axis, fontSize: 11 }}
                />
                <YAxis tick={{ fill: chartColors.axis, fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(13,148,136,0.12)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(13,148,136,0.35)',
                    background: 'rgba(15,23,42,0.95)',
                    color: '#e2e8f0',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Units"
                  fill={chartColors.barBox}
                  radius={[8, 8, 0, 0]}
                  animationDuration={450}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </section>

      <section className="glass-panel rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/50 to-slate-900/60 p-4 shadow-[0_0_28px_rgba(239,68,68,0.15)] backdrop-blur-xl sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-red-300">
          Low stock spotlight
        </h2>
        <p className="mt-1 text-xs text-red-200/70">
          Items at ≤2 units — same rule as stock view & WhatsApp report.
        </p>
        <ul className="mt-4 space-y-2">
          {critical.length === 0 ? (
            <li className="text-sm text-slate-400">No critical items right now.</li>
          ) : (
            critical.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-100 shadow-[0_0_18px_rgba(239,68,68,0.25)]"
              >
                <span className="font-semibold">
                  {p.productName}{' '}
                  <span className="font-normal text-red-300/80">
                    · Box {p.boxNumber} · {p.category}
                  </span>
                </span>
                <span className="font-bold tabular-nums">
                  {p.quantity} ⚠ LOW STOCK
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="glass-panel rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/90">
          Structured report preview
        </h2>
        <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-left text-xs leading-relaxed text-slate-200 sm:text-sm">
          {hasData ? formatTextReport(products) : 'No data yet.'}
        </pre>
      </section>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-emerald-500/25 bg-emerald-950/20 text-sm text-slate-400">
      Add products to see this chart.
    </div>
  )
}

function formatTextReport(products: Product[]): string {
  const grouped = groupByBoxThenCategory(products)
  const lines: string[] = []
  for (const box of sortBoxKeys([...grouped.keys()])) {
    lines.push(`Box ${box}`)
    const catMap = grouped.get(box)!
    for (const cat of [...catMap.keys()].sort((a, b) => a.localeCompare(b))) {
      lines.push(`  ${cat}`)
      for (const p of catMap.get(cat)!) {
        const mark = isLowStock(p.quantity) ? ' ⚠ LOW STOCK' : ''
        lines.push(`    - ${p.productName}: ${p.quantity}${mark}`)
      }
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}
