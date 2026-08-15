import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { SideNav } from './SideNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <SideNav />
      <main className="ml-56 pt-16">
        <div className="mx-auto max-w-5xl p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
