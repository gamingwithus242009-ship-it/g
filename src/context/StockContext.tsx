import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db, firebaseReady } from '../firebase/client'
import { buildWhatsAppReport } from '../lib/reportText'
import type { Product } from '../types'
import { useAuth } from './AuthContext'
import { useSubscription } from './SubscriptionContext'

interface StockContextValue {
  products: Product[]
  categories: string[]
  productsLoading: boolean
  addProductsFromRows: (rows: Omit<Product, 'id'>[]) => Promise<void>
  registerCategories: (names: string[]) => Promise<void>
  updateUsed: (productId: string, used: number) => Promise<void>
  openWhatsAppShare: () => void
}

const StockContext = createContext<StockContextValue | null>(null)

function sortProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const box = a.boxNumber.localeCompare(b.boxNumber, undefined, {
      numeric: true,
    })
    if (box !== 0) return box
    return a.productName.localeCompare(b.productName)
  })
}

export function StockProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { active: subscribed } = useSubscription()
  const uid = user?.uid

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    if (!firebaseReady || !db) {
      setProducts([])
      setCategories([])
      setProductsLoading(false)
      return
    }
    if (!uid || !subscribed) {
      setProducts([])
      setCategories([])
      setProductsLoading(false)
      return
    }

    setProductsLoading(true)
    const userRef = doc(db, 'users', uid)

    const unsubUser = onSnapshot(userRef, (snap) => {
      const c = snap.data()?.categories
      setCategories(Array.isArray(c) ? [...c].sort((a, b) => a.localeCompare(b)) : [])
    })

    const productsQ = query(collection(db, 'users', uid, 'products'))
    const unsubProducts = onSnapshot(productsQ, (snap) => {
      const list: Product[] = []
      snap.forEach((d) => {
        const x = d.data() as Omit<Product, 'id'>
        list.push({
          id: d.id,
          productName: x.productName,
          category: x.category,
          boxNumber: x.boxNumber,
          quantity: Number(x.quantity) || 0,
        })
      })
      setProducts(sortProducts(list))
      setProductsLoading(false)
    })

    return () => {
      unsubUser()
      unsubProducts()
    }
  }, [uid, subscribed])

  const userRef =
    firebaseReady && db && uid ? doc(db, 'users', uid) : null

  const registerCategories = useCallback(
    async (names: string[]) => {
      if (!userRef || !db) return
      const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))]
      if (cleaned.length === 0) return
      await setDoc(
        userRef,
        { categories: arrayUnion(...cleaned) },
        { merge: true },
      )
    },
    [userRef],
  )

  const addProductsFromRows = useCallback(
    async (rows: Omit<Product, 'id'>[]) => {
      if (!uid || !userRef || !db) return
      const batch = writeBatch(db)
      const categoryNames: string[] = []
      for (const r of rows) {
        const id = crypto.randomUUID()
        const ref = doc(db, 'users', uid, 'products', id)
        batch.set(ref, {
          productName: r.productName,
          category: r.category,
          boxNumber: r.boxNumber,
          quantity: r.quantity,
        })
        categoryNames.push(r.category)
      }
      const uniqueCats = [...new Set(categoryNames.map((c) => c.trim()).filter(Boolean))]
      if (uniqueCats.length) {
        batch.set(
          userRef,
          { categories: arrayUnion(...uniqueCats) },
          { merge: true },
        )
      }
      await batch.commit()
    },
    [uid, userRef],
  )

  const updateUsed = useCallback(
    async (productId: string, used: number) => {
      if (!uid || !db) return
      const pref = doc(db, 'users', uid, 'products', productId)
      const current = products.find((p) => p.id === productId)
      if (!current) return
      const nextQty = current.quantity - used
      if (nextQty <= 0) {
        await deleteDoc(pref)
        return
      }
      await updateDoc(pref, { quantity: nextQty })
    },
    [uid, products],
  )

  const openWhatsAppShare = useCallback(() => {
    const text = buildWhatsAppReport(products)
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [products])

  const value = useMemo<StockContextValue>(
    () => ({
      products,
      categories,
      productsLoading,
      addProductsFromRows,
      registerCategories,
      updateUsed,
      openWhatsAppShare,
    }),
    [
      products,
      categories,
      productsLoading,
      addProductsFromRows,
      registerCategories,
      updateUsed,
      openWhatsAppShare,
    ],
  )

  return (
    <StockContext.Provider value={value}>{children}</StockContext.Provider>
  )
}

export function useStock() {
  const ctx = useContext(StockContext)
  if (!ctx) throw new Error('useStock must be used within StockProvider')
  return ctx
}
