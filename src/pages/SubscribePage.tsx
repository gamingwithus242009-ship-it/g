import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'
import { db } from '../firebase/client' 
import type { PaymentStatus, PaymentSubmission } from '../types'
import { ROUTES } from '../routes'
import { isClientAdmin } from '../lib/adminClient'

const UPI_ID = import.meta.env.VITE_UPI_ID || 'your.upi@bank'
const PAY_AMOUNT = import.meta.env.VITE_PAYMENT_AMOUNT || '100'

function mapDoc(id: string, d: Record<string, unknown>): PaymentSubmission {
  return {
    id,
    userId: String(d.userId ?? ''),
    userName: String(d.userName ?? ''),
    transactionId: String(d.transactionId ?? ''),
    screenshotStoragePath: '', 
    status: (d.status as PaymentStatus) || 'pending',
    createdAt: d.createdAt as PaymentSubmission['createdAt'],
    reviewedAt: d.reviewedAt as PaymentSubmission['reviewedAt'],
  }
}

export function SubscribePage() {
  const { user } = useAuth()
  const { loading: subLoading, active } = useSubscription()
  const [latest, setLatest] = useState<PaymentSubmission | null>(null)
  const [latestLoading, setLatestLoading] = useState(true)

  const [txId, setTxId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doneMsg, setDoneMsg] = useState<string | null>(null)

  // --- AUTO-REDIRECT LOGIC ---
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        window.location.href = ROUTES.home;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  useEffect(() => {
    if (!user || !db) {
      setLatestLoading(false);
      return;
    }
    const q = query(
      collection(db, 'payment_submissions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1),
    )
    const unsub = onSnapshot(q, (snap) => {
        const doc = snap.docs[0]
        setLatest(doc ? mapDoc(doc.id, doc.data()) : null)
        setLatestLoading(false)
      }, () => setLatestLoading(false)
    )
    return unsub
  }, [user])

  if (!user) return <Navigate to={ROUTES.login} replace />
  if (subLoading || latestLoading) return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  )
  
  // Active hone par redirect useEffect sambhaal lega, par safety ke liye:
  if (active) return <Navigate to={ROUTES.home} replace />

  const pending = latest?.status === 'pending'
  const showForm = !pending && latest?.status !== 'approved'

  const submit = async () => {
    setError(null)
    setDoneMsg(null)
    
    if (!txId.trim() || txId.trim().length < 8) {
      setError('Please enter a valid 12-digit UTR / Transaction ID.')
      return
    }

    setBusy(true)
    try {
      if (!db) throw new Error('Database unavailable.')

      await addDoc(collection(db, 'payment_submissions'), {
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        transactionId: txId.trim(),
        screenshotStoragePath: '', 
        status: 'pending',
        createdAt: serverTimestamp(),
      })

      setTxId('')
      setDoneMsg('Submitted! Verification usually takes 5-10 mins.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed.')
    } finally {
      setBusy(false)
    }
  }

  // UPI Deep Link for Auto-Pay
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=AppSubscription&am=${PAY_AMOUNT}&cu=INR`;

  return (
    <div className="relative min-h-[100dvh] bg-slate-950 px-4 py-10 flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">Activate Premium</h1>
          <p className="mt-2 text-slate-400 font-medium">Simple UPI Payment</p>
        </div>

        <div className="glass-panel rounded-[2rem] border border-white/10 bg-slate-900/50 p-6 backdrop-blur-2xl shadow-2xl">
          
          {pending && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-pulse">
              <div className="h-16 w-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-cyan-400 font-bold text-lg">Verifying Payment</h2>
              <p className="text-cyan-200/60 text-sm mt-1 px-4">Admin is checking your Transaction ID. Please don't submit again.</p>
            </div>
          )}

          {showForm && (
            <div className="space-y-6">
              {/* QR CODE SECTION */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Scan QR Code</span>
                <img 
                  src="/qr-code.png" 
                  alt="Payment QR" 
                  className="w-44 h-44 object-contain"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/200?text=QR+Code+Not+Found')}
                />
                <p className="mt-2 text-slate-900 font-black text-xl">₹{PAY_AMOUNT}</p>
              </div>

              {/* AUTO-PAY BUTTON */}
              <div className="text-center">
                <p className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-widest">— OR —</p>
                <a 
                  href={upiUrl}
                  className="block w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 text-center"
                >
                  Pay via UPI App
                </a>
              </div>

              {/* UTR INPUT */}
              <div className="pt-6 border-t border-white/5">
                <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-3 tracking-[0.2em]">
                  Transaction ID / UTR Number
                </label>
                <input
                  className="w-full bg-slate-950/50 border border-white/10 text-white p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Enter 12-digit number"
                />
                
                {error && <p className="mt-3 text-xs text-red-400 bg-red-400/10 p-2 rounded-lg text-center">{error}</p>}
                {doneMsg && <p className="mt-3 text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded-lg text-center">{doneMsg}</p>}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void submit()}
                  className="mt-6 w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {busy ? 'Processing...' : 'Confirm Submission'}
                </button>
              </div>
            </div>
          )}

          {isClientAdmin(user.email) && (
            <div className="mt-8 text-center">
              <Link to={ROUTES.admin} className="text-xs text-slate-500 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4">
                Switch to Admin Console
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
