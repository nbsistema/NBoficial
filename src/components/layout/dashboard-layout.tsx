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

  console.log('📊 DashboardLayout: Renderizando com estado:', { 
    user: user?.id ? 'exists' : 'null', 
    profile: profile?.role || 'null', 
    loading, 
    error,
    allowedRoles 
  })

  useEffect(() => {
    console.log('📊 DashboardLayout: useEffect executado:', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role,
      allowedRoles
    })
    
    if (!loading) {
      if (!user) {
        console.log('📊 DashboardLayout: Sem usuário, redirecionando para login')
        navigate('/login')
        return
      }

      if (!profile) {
        console.log('📊 DashboardLayout: Sem perfil, redirecionando para login')
        navigate('/login')
        return
      }

      if (!allowedRoles.includes(profile.role)) {
        console.log('📊 DashboardLayout: Role não permitido, redirecionando para unauthorized')
        navigate('/unauthorized')
        return
      }

      console.log('✅ DashboardLayout: Todas as verificações passaram, mostrando dashboard')
    }
  }, [user, profile, loading, allowedRoles, navigate])

  // Show loading while checking authentication
  if (loading) {
    console.log('📊 DashboardLayout: Mostrando loading')
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
    console.log('🚨 DashboardLayout: Mostrando erro:', error)
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

  // Show loading if user or profile is missing (will redirect)
  if (!user || !profile) {
    console.log('📊 DashboardLayout: Usuário ou perfil ausente, mostrando loading durante redirecionamento')
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
    console.log('📊 DashboardLayout: Role não permitido, mostrando loading durante redirecionamento')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  console.log('✅ DashboardLayout: Renderizando dashboard para role:', profile.role)
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