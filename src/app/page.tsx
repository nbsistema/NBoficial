import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()
  const [forceRedirect, setForceRedirect] = useState(false)

  console.log('🏠 HomePage: Renderizando com estado:', { 
    user: user?.id ? 'exists' : 'null', 
    profile: profile?.role || 'null', 
    loading, 
    error 
  })

  // Timeout de segurança para evitar loop infinito
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ HomePage: Timeout no loading, forçando redirecionamento')
        setForceRedirect(true)
      }
    }, 15000) // 15 segundos

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Forçar redirecionamento para login se timeout
  if (forceRedirect) {
    console.log('🏠 HomePage: Redirecionamento forçado para login')
    return <Navigate to="/login" replace />
  }

  // Show loading while checking authentication
  if (loading && !forceRedirect) {
    console.log('🏠 HomePage: Mostrando loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando autenticação...</p>
          <p className="mt-2 text-xs text-gray-500">Se esta tela persistir, recarregue a página</p>
        </div>
      </div>
    )
  }

  // Show error if there's an authentication error
  if (error) {
    console.log('🚨 HomePage: Mostrando erro:', error)
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

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🏠 HomePage: Sem usuário, redirecionando para login')
    return <Navigate to="/login" replace />
  }

  // Redirect to login if no profile found
  if (!profile) {
    console.log('🏠 HomePage: Sem perfil, redirecionando para login')
    return <Navigate to="/login" replace />
  }

  // Redirect based on user role
  console.log('🏠 HomePage: Redirecionando baseado no role:', profile.role)
  switch (profile.role) {
    case 'admin':
      console.log('🏠 HomePage: Redirecionando para /admin')
      return <Navigate to="/admin" replace />
    case 'ctr':
      console.log('🏠 HomePage: Redirecionando para /ctr')
      return <Navigate to="/ctr" replace />
    case 'parceiro':
      console.log('🏠 HomePage: Redirecionando para /parceiro')
      return <Navigate to="/parceiro" replace />
    case 'checkup':
      console.log('🏠 HomePage: Redirecionando para /checkup')
      return <Navigate to="/checkup" replace />
    default:
      console.log('🚨 HomePage: Role desconhecido, redirecionando para login')
      return <Navigate to="/login" replace />
  }
}

export default HomePage