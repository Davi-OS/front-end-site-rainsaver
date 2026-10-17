import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PluvialCalculatorPage } from '@/pages/PluvialCalculatorPage'
import { SolarCalculatorPage } from '@/pages/SolarCalculatorPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { RootRedirect } from '@/pages/RootRedirect'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pluvial" element={<PluvialCalculatorPage />} />
              <Route path="/solar" element={<SolarCalculatorPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
