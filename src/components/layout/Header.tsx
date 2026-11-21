import { useEffect, useState, type Ref } from 'react'
import { LogOut, Menu, Star, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { ButtonLink, Skeleton } from '@/components/ui'
import { useSubscription } from '@/subscription/useSubscription'
import { Logo } from './Logo'

interface HeaderProps {
  menuOpen: boolean
  onMenuToggle: () => void
  menuButtonRef: Ref<HTMLButtonElement>
}

export function Header({ menuOpen, onMenuToggle, menuButtonRef }: HeaderProps) {
  const { user, status, logout } = useAuth()
  const { isSubscriber } = useSubscription()

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [leavingToLogout, setLeavingToLogout] = useState(false)

  // Logging out on a protected page would make its route guard redirect to /login
  // (router updates are deferred, the auth update is not). So first go to the
  // public home, and only end the session once we are actually there.
  const handleLogout = () => {
    if (pathname === '/') void logout()
    else {
      setLeavingToLogout(true)
      navigate('/')
    }
  }

  useEffect(() => {
    if (leavingToLogout && pathname === '/') {
      setLeavingToLogout(false)
      void logout()
    }
  }, [leavingToLogout, pathname, logout])

  return (
    <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-1">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
        <Link
          to="/"
          aria-label="RainSaver, ir para a página inicial"
          className="-mx-1 rounded-lg px-1 py-1 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <Logo />
        </Link>
      </div>

      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {status === 'authenticated' && (
          <>
            {isSubscriber && (
              <span className="hidden items-center gap-1 rounded-full bg-sun-100 px-2.5 py-1 text-xs font-semibold text-sun-800 sm:inline-flex">
                <Star className="h-3 w-3" aria-hidden="true" />
                Assinante
              </span>
            )}
            {user && (
              <span className="hidden min-w-0 truncate text-sm text-slate-600 sm:inline" title={user.email}>
                {user.email}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="max-sm:sr-only">Sair</span>
            </button>
          </>
        )}
        {status === 'anonymous' && (
          <>
            <ButtonLink to="/login" variant="secondary">
              Entrar
            </ButtonLink>
            {/* Below sm there is no room: "Criar conta" lives in the page CTA and the menu. */}
            <ButtonLink to="/cadastro" className="max-sm:hidden">
              Criar conta
            </ButtonLink>
          </>
        )}
        {/* A saved session is being validated: reserve the space, show neither state. */}
        {status === 'loading' && <Skeleton className="h-11 w-28" />}
      </div>
    </header>
  )
}
