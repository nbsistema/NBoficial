import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()

  console.log('🏠 HomePage: Renderizando com estado:', { 
    user: user?.id ? 'exists' : 'null', 
    profile: profile?.role || 'null', 
    loading, 
    error 
  })

  // Show loading while checking authentication
  if (loading) {
    console.log('🏠 HomePage: Mostrando loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Carregando...</p>
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