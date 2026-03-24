import type { Timestamp } from 'firebase/firestore'

export interface Product {
  id: string
  productName: string
  category: string
  boxNumber: string
  quantity: number
}

/** Stored on users/{uid} — subscription */
export interface SubscriptionState {
  isActive: boolean
  expiryDate: Timestamp | null
  paymentId: string
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

/** payment_submissions/{id} */
export interface PaymentSubmission {
  id: string
  userId: string
  userName: string
  transactionId: string
  screenshotStoragePath: string
  status: PaymentStatus
  createdAt: Timestamp | null
  reviewedAt: Timestamp | null
}

export const LOW_STOCK_MAX = 2

export function isLowStock(quantity: number): boolean {
  return quantity <= LOW_STOCK_MAX
}
