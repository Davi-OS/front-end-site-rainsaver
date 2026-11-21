import { Outlet } from 'react-router-dom'
import { Logo } from './Logo'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <main className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
