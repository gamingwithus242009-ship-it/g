/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_API_URL: string
  /** Manual UPI ID shown on subscribe page */
  readonly VITE_UPI_ID: string
  /** Display amount (e.g. 100) */
  readonly VITE_PAYMENT_AMOUNT: string
  /** Comma-separated admin emails (same as server ADMIN_EMAILS — UI hint only) */
  readonly VITE_ADMIN_EMAILS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
