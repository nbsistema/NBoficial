import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, Navigate } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Loading } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DashboardLayoutProps {
  children: ReactNode
  allowedRoles: Array<'admin' | 'ctr' | 'parceiro' | 'checkup'>
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, profile, loading, error } = useAuth()
  const navigate = useNavigate()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Timeout de segurança
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setTimeoutReached(true)
      }
    }, 12000)
    return () => clearTimeout(timeoutId)
  }, [loading])

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        navigate('/login')
        return
      }
      if (!allowedRoles.includes(profile.role)) {
        navigate('/unauthorized')
        return
      }
    }
  }, [user, profile, loading, allowedRoles, navigate])

  if (timeoutReached) {
    return <Navigate to="/login" replace />
  }

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
        <p className="mt-4 text-sm text-gray-600">Verificando permissões...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Alert className="max-w-md">
          <AlertDescription>
            {error}. Verifique a configuração do Supabase.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user || !profile) return null
  if (!allowedRoles.includes(profile.role)) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
