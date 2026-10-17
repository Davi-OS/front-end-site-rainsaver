import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/components/ui'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  // Wait for the stored session to be validated before deciding.
  if (status === 'loading') return <FullPageSpinner />
  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
