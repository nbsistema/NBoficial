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

  console.log('DashboardLayout render:', { 
    user: user?.id ? 'exists' : 'null', 
    profile: profile?.role || 'null', 
    loading, 
    error,
    allowedRoles 
  })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('DashboardLayout: No user, redirecting to login')
        navigate('/login')
        return
      }

      if (!profile) {
        console.log('DashboardLayout: No profile, redirecting to login')
        navigate('/login')
        return
      }

      if (!allowedRoles.includes(profile.role)) {
        console.log('DashboardLayout: Role not allowed, redirecting to unauthorized')
        navigate('/unauthorized')
        return
      }

      console.log('DashboardLayout: All checks passed, showing dashboard')
    }
  }, [user, profile, loading, allowedRoles, navigate])

  // Show loading while checking authentication
  if (loading) {
    console.log('DashboardLayout: showing loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error if there's an authentication error
  if (error) {
    console.log('DashboardLayout: showing error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Alert className="max-w-md">
          <AlertDescription>
            {error}. Please check your Supabase configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show loading if user or profile is missing (will redirect)
  if (!user || !profile) {
    console.log('DashboardLayout: missing user or profile, showing loading while redirecting')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Show loading if user doesn't have permission (will redirect)
  if (!allowedRoles.includes(profile.role)) {
    console.log('DashboardLayout: role not allowed, showing loading while redirecting')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  console.log('DashboardLayout: rendering dashboard for role:', profile.role)
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