import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { FullPageSpinner } from '@/components/ui'

export function RootRedirect() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageSpinner />
  return <Navigate to={status === 'authenticated' ? '/dashboard' : '/login'} replace />
}
