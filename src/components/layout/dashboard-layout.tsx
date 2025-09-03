import { ReactNode, useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, Navigate } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Loading } from '@/components/ui/loading'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DashboardLayoutProps {
  children: ReactNode
  allowedRoles?: Array<'admin' | 'ctr' | 'parceiro' | 'checkup'>
  requireAdmin?: boolean
}

export function DashboardLayout({ children, allowedRoles = [], requireAdmin = false }: DashboardLayoutProps) {
  const { user, profile, loading, error, hasPermission, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  console.log('🏗️ DashboardLayout: Estado atual:', {
    hasUser: !!user,
    userId: user?.id,
    profileRole: profile?.role,
    loading,
    isAdmin,
    allowedRoles,
    error
  })

  // Debug detalhado
  useEffect(() => {
    setDebugInfo({
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      userId: user?.id,
      hasProfile: !!profile,
      profileRole: profile?.role,
      loading,
      isAdmin,
      allowedRoles,
      error,
      timeoutReached
    })
  }, [user, profile, loading, allowedRoles, error, timeoutReached])

  // Timeout de segurança
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ DashboardLayout: Timeout no loading', debugInfo)
        setTimeoutReached(true)
      }
    }, 15000) // Aumentar timeout
    return () => clearTimeout(timeoutId)
  }, [loading, debugInfo])

  // Verificação de permissões
  const hasAccess = useMemo(() => {
    if (!profile) return false
    
    // Admin sempre tem acesso total
    if (isAdmin) return true
    
    // Se requer admin especificamente
    if (requireAdmin) return false
    
    // Verificar roles permitidos
    return allowedRoles.length === 0 || hasPermission(allowedRoles)
  }, [profile, isAdmin, requireAdmin, allowedRoles, hasPermission])

  useEffect(() => {
    if (!loading && !timeoutReached) {
      if (!user) {
        console.log('🏗️ DashboardLayout: Sem usuário, redirecionando para login', debugInfo)
        navigate('/login')
        return
      }
      
      if (!profile) {
        console.log('🏗️ DashboardLayout: Sem perfil, redirecionando para login', debugInfo)
        navigate('/login')
        return
      }

      // Verificar acesso
      if (!hasAccess) {
        console.log('🏗️ DashboardLayout: Acesso negado:', profile.role, 'permitidos:', allowedRoles, debugInfo)
        navigate('/unauthorized')
        return
      }

      console.log('🏗️ DashboardLayout: Acesso autorizado para role:', profile.role, debugInfo)
    }
  }, [user, profile, loading, allowedRoles, navigate, timeoutReached])

  if (timeoutReached) {
    console.log('🏗️ DashboardLayout: Timeout atingido, redirecionando', debugInfo)
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando permissões...</p>
          <details className="mt-4 text-xs text-gray-400">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

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