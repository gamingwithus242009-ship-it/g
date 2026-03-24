import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isClientAdmin } from '../lib/adminClient'
import { ROUTES } from '../routes'

// Render backend URL - Ensure your backend has these routes defined under /api/admin/...
const API_URL = 'https://my-ccw9.onrender.com' 

type Row = {
  id: string
  userId: string
  userName: string
  transactionId: string
  status: string
  createdAt: number | null
  reviewedAt: number | null
  subscriptionDays?: number 
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

export function AdminPage() {
  const { user, getIdToken } = useAuth()
  const [filter, setFilter] = useState<Filter>('all')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      const token = await getIdToken()
      if (!token) throw new Error('Not signed in')
      
      const qs = filter === 'all' ? '' : `?status=${encodeURIComponent(filter)}`
      
      // Requesting JSON from Render backend
      const res = await fetch(`${API_URL}/api/admin/payments${qs}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' // Explicitly asking for JSON
        },
      })

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json() as { payments?: Row[]; error?: string }
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        setRows(data.payments ?? [])
      } else {
        // This handles the "Unexpected token <" error by showing what actually came back
        const text = await res.text();
        console.error("Server returned non-JSON:", text);
        throw new Error("Server ne JSON ki jagah HTML bhej diya. Path check karein.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [user, getIdToken, filter])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  const editDays = async (id: string, currentDays?: number) => {
    const promptValue = currentDays ? currentDays.toString() : "30";
    const newDays = prompt("Kitne din ka subscription dena hai?", promptValue);
    if (!newDays || isNaN(Number(newDays))) return;
    
    setActionId(id)
    try {
      const token = await getIdToken()
      const res = await fetch(`${API_URL}/api/admin/payments/${id}/edit-days`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: Number(newDays) })
      })
      if (!res.ok) throw new Error('Update failed')
      alert("✅ Days updated!");
      await load();
    } catch (e) {
      alert("Failed to update");
    } finally {
      setActionId(null)
    }
  }

  const act = async (id: string, action: 'approve' | 'reject' | 'disable') => {
    setActionId(id)
    try {
      const token = await getIdToken()
      const res = await fetch(`${API_URL}/api/admin/payments/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Action failed')
      await load()
    } catch (e) {
      setError('Action failed')
    } finally {
      setActionId(null)
    }
  }

   const handleDelete = async (id: string, userName: string) => {
    const confirmDelete = window.confirm(`Bhai, kya sach mein "${userName}" ki payment delete karni hai?`);
    if (!confirmDelete) return;

    setActionId(id);
    try {
      const token = await getIdToken();
      
      // ✅ 1. Match path: /api/admin/payments/:id/delete
      // ✅ 2. Match method: POST
      const res = await fetch(`${API_URL}/api/admin/payments/${id}/delete`, {
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // Agar server HTML page bhej raha hai (Unexpected token < error)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend ne JSON nahi bheja. Check karein ki backend live hai ya nahi.");
      }

      const data = await res.json();

      // Backend returns { ok: true } or { error: "..." }
      if (!res.ok || (data && data.ok === false)) {
        throw new Error(data.error || 'Delete failed on server');
      }

      // Success! Frontend list update karo
      setRows(prevRows => prevRows.filter(row => row.id !== id));
      alert("✅ Done! Record gayab ho gaya.");

    } catch (e) {
      console.error("Delete call failed:", e);
      alert(e instanceof Error ? e.message : "Network error: Delete nahi ho paya");
    } finally {
      setActionId(null);
    }
  };


  const fmt = (ms: number | null) => ms ? new Date(ms).toLocaleString('en-IN') : '—'

  if (!user) return <Navigate to={ROUTES.login} replace />
  if (!isClientAdmin(user.email)) return <div className="p-10 text-center text-white">Access Denied</div>

  return (
    <div className="min-h-[100dvh] bg-slate-950 px-4 py-8 text-white font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6 border-slate-800">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight italic">ADMIN <span className="text-emerald-500">PRO</span></h1>
            <p className="text-slate-400 text-sm mt-1 font-medium italic">Dark Mode Active - Render Live</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Link to={ROUTES.home} className="bg-white px-5 py-2.5 rounded-xl text-sm font-bold text-black hover:bg-slate-200 transition-all">
              Exit
            </Link>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">{error}</div>}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">Connecting to Render...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500">No records found.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white">{r.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{fmt(r.createdAt)}</div>
                      {r.subscriptionDays && (
                        <div className="text-[11px] text-emerald-400 font-bold mt-1 uppercase italic">{r.subscriptionDays} Days</div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-white font-bold bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                        {r.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        r.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2.5 items-center">
                        <button 
                          onClick={() => editDays(r.id, r.subscriptionDays)}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          disabled={actionId === r.id}
                        >
                          <EditIcon />
                        </button>

                        <button 
                          onClick={() => handleDelete(r.id, r.userName)}
                          className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          disabled={actionId === r.id}
                        >
                          <TrashIcon />
                        </button>

                        <div className="w-px h-4 bg-slate-800 ml-1"></div>

                        {r.status === 'pending' ? (
                          <>
                            <button
                              disabled={actionId === r.id}
                              onClick={() => void act(r.id, 'approve')}
                              className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-500"
                            > APPROVE </button>
                            <button
                              disabled={actionId === r.id}
                              onClick={() => void act(r.id, 'reject')}
                              className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded hover:bg-red-600 hover:text-white"
                            > REJECT </button>
                          </>
                        ) : r.status === 'approved' ? (
                          <button
                            disabled={actionId === r.id}
                            onClick={() => void act(r.id, 'disable')}
                            className="px-3 py-1 bg-red-600/10 text-red-500 border border-red-600/20 text-[10px] font-bold rounded hover:bg-red-600 hover:text-white"
                          > DISABLE </button>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-bold uppercase px-2">LOCKED</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  )
}
