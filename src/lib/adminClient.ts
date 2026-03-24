/** Client-side hint only — real admin checks happen on the API. */
export function isClientAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const set = new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
  return set.has(email.toLowerCase())
}
