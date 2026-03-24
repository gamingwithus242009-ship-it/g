import type { Timestamp } from 'firebase/firestore'
import type { SubscriptionState } from '../types'

export function subscriptionIsActive(
  sub: SubscriptionState | null | undefined,
): boolean {
  if (!sub?.isActive || !sub.expiryDate) return false
  try {
    return sub.expiryDate.toMillis() > Date.now()
  } catch {
    return false
  }
}

export function remainingDays(expiry: Timestamp | null | undefined): number {
  if (!expiry) return 0
  const ms = expiry.toMillis() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}
