import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, firebaseReady } from '../firebase/client'
import { remainingDays, subscriptionIsActive } from '../lib/subscriptionHelpers'
import type { SubscriptionState } from '../types'
import { useAuth } from './AuthContext'

interface SubscriptionContextValue {
  loading: boolean
  /** True when subscription is paid and not past expiry */
  active: boolean
  subscription: SubscriptionState | null
  remainingDays: number
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null,
  )

  useLayoutEffect(() => {
    if (user) setLoading(true)
    else setLoading(false)
  }, [user])

  useEffect(() => {
    if (!firebaseReady || !db) {
      setSubscription(null)
      setLoading(false)
      return
    }
    if (!user) {
      setSubscription(null)
      return
    }
    const ref = doc(db, 'users', user.uid)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const raw = snap.data()?.subscription as
          | Partial<SubscriptionState>
          | undefined
        if (!raw) {
          setSubscription(null)
          setLoading(false)
          return
        }
        const normalized: SubscriptionState = {
          isActive: Boolean(raw.isActive),
          expiryDate: raw.expiryDate ?? null,
          paymentId: typeof raw.paymentId === 'string' ? raw.paymentId : '',
        }
        setSubscription(normalized)
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )
    return unsub
  }, [user])

  const active = subscriptionIsActive(subscription ?? undefined)
  const daysLeft = remainingDays(subscription?.expiryDate ?? undefined)

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      loading,
      active,
      subscription,
      remainingDays: daysLeft,
    }),
    [loading, active, subscription, daysLeft],
  )

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return ctx
}
