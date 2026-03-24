import { useCallback, useMemo, useState } from 'react'
import { useStock } from '../context/StockContext'
import type { Product } from '../types'

const NEW_CAT = '__new__'

interface DraftRow {
  id: string
  productName: string
  category: string
  boxNumber: string
  quantity: string
}

function emptyRow(): DraftRow {
  return {
    id: crypto.randomUUID(),
    productName: '',
    category: '',
    boxNumber: '',
    quantity: '',
  }
}

/** Add Products — table entry, validation, categories (logic lives here). */
export function AddProductsPage() {
  const { categories, addProductsFromRows, registerCategories } = useStock()
  const [rows, setRows] = useState<DraftRow[]>(() => [emptyRow()])
  const [newCatForRow, setNewCatForRow] = useState<string | null>(null)
  const [newCatDraft, setNewCatDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sortedCats = useMemo(
    () => [...categories].sort((a, b) => a.localeCompare(b)),
    [categories],
  )

  const updateRow = useCallback((id: string, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    )
  }, [])

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()])
  }, [])

  const commitNewCategory = useCallback(
    async (rowId: string) => {
      const name = newCatDraft.trim()
      if (!name) {
        setNewCatForRow(null)
        setNewCatDraft('')
        return
      }
      try {
        await registerCategories([name])
        updateRow(rowId, { category: name })
      } catch {
        setError('Could not save category. Try again.')
      }
      setNewCatForRow(null)
      setNewCatDraft('')
    },
    [newCatDraft, registerCategories, updateRow],
  )

  const save = useCallback(async () => {
    setError(null)
    const parsed: Omit<Product, 'id'>[] = []
    for (const r of rows) {
      const productName = r.productName.trim()
      const category = r.category.trim()
      const boxNumber = r.boxNumber.trim()
      const qtyNum = Number(r.quantity)
      if (!productName || !category || !boxNumber || r.quantity === '') {
        setError('Please fill every field in each row.')
        return
      }
      if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
        setError('Quantity must be a number greater than 0.')
        return
      }
      parsed.push({
        productName,
        category,
        boxNumber,
        quantity: Math.floor(qtyNum),
      })
    }
    if (parsed.length === 0) {
      setError('Add at least one complete row.')
      return
    }
    try {
      await addProductsFromRows(parsed)
      setRows([emptyRow()])
    } catch {
      setError('Could not save products. Check connection and try again.')
    }
  }, [addProductsFromRows, rows])

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Add Products
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Table entry — add rows as needed. Categories persist and cannot be
          deleted.
        </p>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-500/20 bg-emerald-950/40 text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
                <th className="px-3 py-3 sm:px-4">Product name</th>
                <th className="px-3 py-3 sm:px-4">Category</th>
                <th className="px-3 py-3 sm:px-4">Box number</th>
                <th className="px-3 py-3 sm:px-4">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="px-3 py-2 sm:px-4">
                    <input
                      className="input-premium w-full"
                      value={r.productName}
                      onChange={(e) =>
                        updateRow(r.id, { productName: e.target.value })
                      }
                      placeholder="e.g. Formula 1"
                      autoComplete="off"
                    />
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    {newCatForRow === r.id ? (
                      <input
                        className="input-premium w-full"
                        value={newCatDraft}
                        onChange={(e) => setNewCatDraft(e.target.value)}
                        placeholder="New category name"
                        autoFocus
                        onBlur={() => void commitNewCategory(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void commitNewCategory(r.id)
                        }}
                        autoComplete="off"
                      />
                    ) : (
                      <select
                        className="input-premium w-full cursor-pointer"
                        value={r.category}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === NEW_CAT) {
                            setNewCatForRow(r.id)
                            setNewCatDraft('')
                            return
                          }
                          updateRow(r.id, { category: v })
                        }}
                      >
                        <option value="">Select category</option>
                        {sortedCats.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        {!sortedCats.includes(r.category) && r.category ? (
                          <option value={r.category}>{r.category}</option>
                        ) : null}
                        <option value={NEW_CAT}>+ Add new category</option>
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    <input
                      className="input-premium w-full"
                      inputMode="numeric"
                      value={r.boxNumber}
                      onChange={(e) =>
                        updateRow(r.id, { boxNumber: e.target.value })
                      }
                      placeholder="e.g. 1"
                      autoComplete="off"
                    />
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    <input
                      className="input-premium w-full"
                      type="number"
                      min={1}
                      step={1}
                      value={r.quantity}
                      onChange={(e) =>
                        updateRow(r.id, { quantity: e.target.value })
                      }
                      placeholder="Qty"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error ? (
        <p
          className="rounded-xl border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.15)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-secondary" onClick={addRow}>
          Add Row
        </button>
        <button type="button" className="btn-primary" onClick={() => void save()}>
          Save Products
        </button>
      </div>
    </div>
  )
}
