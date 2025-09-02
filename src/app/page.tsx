import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  console.log('🏠 HomePage: Estado atual:', { 
    hasUser: !!user, 
    userId: user?.id,
    profileRole: profile?.role, 
    loading, 
    error 
  })

  // Debug detalhado do estado
  useEffect(() => {
    setDebugInfo({
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasProfile: !!profile,
      profileRole: profile?.role,
      profileNome: profile?.nome,
      profileEmpresaId: profile?.empresa_id,
      loading,
      error,
      timeoutReached
    })
  }, [user, profile, loading, error, timeoutReached])

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ HomePage: Timeout no loading, redirecionando para login', debugInfo)
        setTimeoutReached(true)
      }
    }, 12000) // 12 segundos

    return () => clearTimeout(timeoutId)
  }, [loading, debugInfo])

  // Redirecionamento forçado por timeout
  if (timeoutReached) {
    console.log('🏠 HomePage: Redirecionamento forçado para login por timeout', debugInfo)
    return <Navigate to="/login" replace />
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log('🏠 HomePage: Mostrando loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando autenticação...</p>
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

  // Mostrar erro se houver problema de autenticação
  if (error) {
    console.log('🚨 HomePage: Erro de autenticação:', error)
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

  // Redirecionar para login se não autenticado
  if (!user) {
    console.log('🏠 HomePage: Sem usuário, redirecionando para login', debugInfo)
    return <Navigate to="/login" replace />
  }

  // Redirecionar para login se não há perfil
  if (!profile) {
    console.log('🏠 HomePage: Sem perfil, redirecionando para login', debugInfo)
    return <Navigate to="/login" replace />
  }

  // Redirecionar baseado no role do usuário
  console.log('🏠 HomePage: Redirecionando baseado no role:', profile.role, debugInfo)
  switch (profile.role) {
    case 'admin':
      return <Navigate to="/admin" replace />
    case 'ctr':
      return <Navigate to="/ctr" replace />
    case 'parceiro':
      return <Navigate to="/parceiro" replace />
    case 'checkup':
      return <Navigate to="/checkup" replace />
    default:
      console.log('🚨 HomePage: Role desconhecido, redirecionando para login', debugInfo)
      return <Navigate to="/login" replace />
  }
}

export default HomePage