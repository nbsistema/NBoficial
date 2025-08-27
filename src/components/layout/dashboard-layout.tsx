import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login')
        return
      }

      if (!profile) {
        navigate('/login')
        return
      }

      if (!allowedRoles.includes(profile.role)) {
        navigate('/unauthorized')
        return
      }
    }
  }, [user, profile, loading, allowedRoles, navigate])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    )
  }

  // Show error if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Alert className="max-w-md">
          <AlertDescription>
            {error}. Tente fazer login novamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show loading if user or profile is missing
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    )
  }

  // Show loading if user doesn't have permission (will redirect)
  if (!allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    )
  }

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