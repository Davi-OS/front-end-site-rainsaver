import { useEffect, useRef } from 'react'
import { LayoutDashboard, Droplets, Lock, Star, Sun, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { ButtonLink } from '@/components/ui'
import { SUBSCRIPTION_MODE } from '@/config'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: LayoutDashboard, requiresLogin: false },
  { to: '/pluvial', label: 'Economia Pluvial', icon: Droplets, requiresLogin: true },
  { to: '/solar', label: 'Economia Solar', icon: Sun, requiresLogin: true },
  // The subscription page is public (visitors can see the plans); it only exists while the feature is on.
  ...(SUBSCRIPTION_MODE === 'off' ? [] : [{ to: '/assinatura', label: 'Assinatura', icon: Star, requiresLogin: false }]),
  { to: '/settings', label: 'Configurações', icon: Settings, requiresLogin: true },
]

interface SideNavProps {
  /** Mobile drawer state. From `lg` up the nav is always visible. */
  open: boolean
  onClose: () => void
}

export function SideNav({ open, onClose }: SideNavProps) {
  const navRef = useRef<HTMLElement>(null)
  const { status } = useAuth()
  const anonymous = status === 'anonymous'

  // Opening the drawer moves focus into it, so keyboard users land on the links.
  useEffect(() => {
    if (open) navRef.current?.querySelector<HTMLElement>('a')?.focus()
  }, [open])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        ref={navRef}
        id="menu-principal"
        aria-label="Principal"
        // Opening must flip `visibility` instantly (so focus() can land on a link right
        // away); only closing delays it until the slide-out ends.
        className={`fixed top-16 bottom-0 left-0 z-20 flex w-64 flex-col overflow-y-auto overscroll-contain border-r border-slate-200 bg-white p-3 duration-200 motion-reduce:transition-none lg:visible lg:w-56 lg:translate-x-0 ${
          open
            ? 'visible translate-x-0 shadow-xl transition-transform lg:shadow-none'
            : 'invisible -translate-x-full transition-[transform,visibility]'
        }`}
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, requiresLogin }) => (
            <li key={to}>
              <NavLink
                to={to}
                // "/" would otherwise match every route and stay active.
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 ${
                    isActive
                      ? 'bg-brand-100 font-semibold text-brand-900 shadow-[inset_4px_0_0_var(--color-brand-600)]'
                      : 'font-medium text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {/* The link still works: the route guard sends visitors to the login and brings them back. */}
                {anonymous && requiresLogin && (
                  <>
                    <Lock className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="sr-only">(requer login)</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {anonymous && (
          <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-3 lg:hidden">
            <ButtonLink to="/login" variant="secondary" fullWidth onClick={onClose}>
              Entrar
            </ButtonLink>
            <ButtonLink to="/cadastro" fullWidth onClick={onClose}>
              Criar conta
            </ButtonLink>
          </div>
        )}
      </nav>
    </>
  )
}
