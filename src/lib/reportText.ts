import type { Product } from '../types'
import { isLowStock } from '../types'
import { groupByBoxThenCategory, sortBoxKeys } from './groupStock'

export function buildWhatsAppReport(products: Product[]): string {
  const lines: string[] = ['📦 HERBALIFE STOCK REPORT', '']
  const grouped = groupByBoxThenCategory(products)
  const boxes = sortBoxKeys([...grouped.keys()])

  for (const box of boxes) {
    lines.push(`🔹 Box ${box}`)
    const catMap = grouped.get(box)!
    const cats = [...catMap.keys()].sort((a, b) => a.localeCompare(b))
    for (const cat of cats) {
      lines.push(`▪ ${cat}`)
      const list = catMap.get(cat)!
      for (const p of list) {
        const low = isLowStock(p.quantity)
        const suffix = low ? ' ⚠ LOW STOCK' : ''
        lines.push(`- ${p.productName}: ${p.quantity}${suffix}`)
      }
    }
    lines.push('')
  }

  if (products.length === 0) {
    lines.push('(No products in stock.)')
  }

  return lines.join('\n').trim()
}
