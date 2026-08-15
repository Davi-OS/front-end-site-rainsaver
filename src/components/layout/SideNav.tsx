import { LayoutDashboard, Droplets, Sun, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pluvial', label: 'Economia Pluvial', icon: Droplets },
  { to: '/solar', label: 'Economia Solar', icon: Sun },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

export function SideNav() {
  return (
    <nav className="fixed top-16 bottom-0 left-0 z-10 w-56 border-r border-slate-200 bg-white p-3">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
