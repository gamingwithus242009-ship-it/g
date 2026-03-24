import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  err: Error | null
}

/** Catches render errors so the tab is not an empty dark screen */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[App error]', err, info.componentStack)
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-950 px-6 py-12 text-center">
          <div className="max-w-lg rounded-2xl border border-red-500/30 bg-slate-900/90 p-8">
            <h1 className="text-lg font-bold text-white">Something went wrong</h1>
            <p className="mt-3 text-left text-sm text-slate-400">
              {this.state.err.message}
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
