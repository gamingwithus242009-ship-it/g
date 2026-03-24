/** App route paths — use with React Router `navigate()` / `<Link />`. */
export const ROUTES = {
  home: '/',
  login: '/login',
  admin: '/admin',
  subscribe: '/subscribe',
  add: '/add',
  update: '/update',
  stock: '/stock',
  reports: '/reports',
} as const

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES]
