import type { Product } from '../types'

export function sortBoxKeys(boxes: string[]): string[] {
  return [...boxes].sort((a, b) => {
    const na = Number.parseInt(a, 10)
    const nb = Number.parseInt(b, 10)
    const aNum = !Number.isNaN(na) && String(na) === a.trim()
    const bNum = !Number.isNaN(nb) && String(nb) === b.trim()
    if (aNum && bNum) return na - nb
    return a.localeCompare(b, undefined, { numeric: true })
  })
}

/** Box → Category → products */
export function groupByBoxThenCategory(
  products: Product[],
): Map<string, Map<string, Product[]>> {
  const root = new Map<string, Map<string, Product[]>>()
  for (const p of products) {
    const box = (p.boxNumber ?? '').trim() || '—'
    if (!root.has(box)) root.set(box, new Map())
    const catMap = root.get(box)!
    const cat = (p.category ?? '').trim() || 'Uncategorized'
    if (!catMap.has(cat)) catMap.set(cat, [])
    catMap.get(cat)!.push(p)
  }
  for (const [, catMap] of root) {
    for (const [, list] of catMap) {
      list.sort((a, b) => a.productName.localeCompare(b.productName))
    }
  }
  return root
}

export function categoryTotals(products: Product[]): { name: string; total: number }[] {
  const m = new Map<string, number>()
  for (const p of products) {
    const c = (p.category ?? '').trim() || 'Uncategorized'
    m.set(c, (m.get(c) ?? 0) + p.quantity)
  }
  return [...m.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
}

export function boxTotals(products: Product[]): { name: string; total: number }[] {
  const m = new Map<string, number>()
  for (const p of products) {
    const b = (p.boxNumber ?? '').trim() || '—'
    m.set(b, (m.get(b) ?? 0) + p.quantity)
  }
  const names = sortBoxKeys([...m.keys()])
  return names.map((name) => ({ name, total: m.get(name)! }))
}
