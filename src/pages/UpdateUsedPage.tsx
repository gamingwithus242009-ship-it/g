import { useMemo, useState } from 'react'
import { useStock } from '../context/StockContext'

/** Update used quantities — subtract stock and remove at zero (logic here). */
export function UpdateUsedPage() {
  const { products, updateUsed } = useStock()
  const [productId, setProductId] = useState('')
  const [usedStr, setUsedStr] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const options = useMemo(
    () =>
      [...products].sort((a, b) =>
        `${a.boxNumber} ${a.productName}`.localeCompare(
          `${b.boxNumber} ${b.productName}`,
        ),
      ),
    [products],
  )

  const submit = async () => {
    setError(null)
    setOk(null)
    if (!productId) {
      setError('Choose a product.')
      return
    }
    const used = Number(usedStr)
    if (!Number.isFinite(used) || used <= 0) {
      setError('Used quantity must be greater than 0.')
      return
    }
    try {
      await updateUsed(productId, Math.floor(used))
      setOk('Stock updated. Items at or below zero are removed automatically.')
      setUsedStr('')
      setProductId('')
    } catch {
      setError('Could not update. Try again.')
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Update Used Products
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Subtracts from inventory. At zero or below, the product is removed.
        </p>
      </div>

      <div className="glass-panel space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-400/80">
            Product (name + box)
          </span>
          <select
            className="input-premium w-full cursor-pointer"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select product</option>
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName} — Box {p.boxNumber} (qty {p.quantity})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-400/80">
            Used quantity
          </span>
          <input
            className="input-premium w-full"
            type="number"
            min={1}
            step={1}
            value={usedStr}
            onChange={(e) => setUsedStr(e.target.value)}
            placeholder="How many used?"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-emerald-300" role="status">
            {ok}
          </p>
        ) : null}

        <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => void submit()}>
          Update Used Product
        </button>
      </div>
    </div>
  )
}
