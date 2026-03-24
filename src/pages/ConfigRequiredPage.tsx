import { firebaseInitError } from '../firebase/client'

/** Shown when .env is missing or Firebase fails to boot — avoids a blank screen */
export function ConfigRequiredPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-950 px-6 py-12 text-center">
      <div className="max-w-lg rounded-2xl border border-amber-500/30 bg-slate-900/80 p-8 shadow-xl">
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Firebase configuration needed
        </h1>
        <p className="mt-4 text-left text-sm leading-relaxed text-slate-300">
          The app could not connect to Firebase. Create a{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-emerald-300">
            .env
          </code>{' '}
          file in the project root (copy from{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-emerald-300">
            .env.example
          </code>
          ) and add all{' '}
          <code className="font-mono text-slate-400">VITE_FIREBASE_*</code>{' '}
          values from the Firebase Console → Project settings → Your apps → Web app.
        </p>
        <p className="mt-4 text-left text-sm text-slate-500">
          Then stop and run <code className="text-slate-400">npm run dev</code> again.
        </p>
        {firebaseInitError ? (
          <pre className="mt-6 max-h-48 overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-left text-xs leading-relaxed text-red-200/90 whitespace-pre-wrap">
            {firebaseInitError}
          </pre>
        ) : null}
      </div>
    </div>
  )
}
