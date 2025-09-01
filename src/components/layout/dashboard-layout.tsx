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

  console.log('🏗️ DashboardLayout: Estado atual:', {
    hasUser: !!user,
    profileRole: profile?.role,
    loading,
    allowedRoles,
    error
  })

  // Timeout de segurança
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ DashboardLayout: Timeout no loading')
        setTimeoutReached(true)
      }
    }, 12000)
    return () => clearTimeout(timeoutId)
  }, [loading])

  useEffect(() => {
    if (!loading && !timeoutReached) {
      if (!user) {
        console.log('🏗️ DashboardLayout: Sem usuário, redirecionando para login')
        navigate('/login')
        return
      }
      
      if (!profile) {
        console.log('🏗️ DashboardLayout: Sem perfil, redirecionando para login')
        navigate('/login')
        return
      }

      // Admin tem acesso total ao sistema
      if (profile.role === 'admin') {
        console.log('🏗️ DashboardLayout: Admin detectado, acesso liberado')
        return
      }

      // Outros perfis seguem as regras de autorização
      if (!allowedRoles.includes(profile.role)) {
        console.log('🏗️ DashboardLayout: Role não autorizado:', profile.role, 'permitidos:', allowedRoles)
        navigate('/unauthorized')
        return
      }

      console.log('🏗️ DashboardLayout: Acesso autorizado para role:', profile.role)
    }
  }, [user, profile, loading, allowedRoles, navigate, timeoutReached])

  if (timeoutReached) {
    console.log('🏗️ DashboardLayout: Timeout atingido, redirecionando')
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Alert className="max-w-md" variant="destructive">
          <AlertDescription>
            {error}. Verifique a configuração do Supabase.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  // Admin tem acesso total, outros seguem as regras
  const hasAccess = profile.role === 'admin' || allowedRoles.includes(profile.role)
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />
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