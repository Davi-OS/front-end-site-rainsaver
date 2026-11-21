import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { SideNav } from './SideNav'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Esc closes the mobile drawer and hands focus back to its toggle.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#conteudo"
        className="sr-only z-40 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-xl focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} menuButtonRef={menuButtonRef} />
      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main id="conteudo" tabIndex={-1} className="pt-16 outline-none lg:ml-56">
        <div className="mx-auto max-w-5xl p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
