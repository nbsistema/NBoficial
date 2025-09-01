import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)

  console.log('🏠 HomePage: Estado atual:', { 
    hasUser: !!user, 
    profileRole: profile?.role, 
    loading, 
    error 
  })

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ HomePage: Timeout no loading, redirecionando para login')
        setTimeoutReached(true)
      }
    }, 10000) // 10 segundos

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Redirecionamento forçado por timeout
  if (timeoutReached) {
    console.log('🏠 HomePage: Redirecionamento forçado para login por timeout')
    return <Navigate to="/login" replace />
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log('🏠 HomePage: Mostrando loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Mostrar erro se houver problema de autenticação
  if (error) {
    console.log('🚨 HomePage: Erro de autenticação:', error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Alert className="max-w-md" variant="destructive">
          <AlertDescription>
            {error}. Please check your Supabase configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    console.log('🏠 HomePage: Sem usuário, redirecionando para login')
    return <Navigate to="/login" replace />
  }

  // Redirecionar para login se não há perfil
  if (!profile) {
    console.log('🏠 HomePage: Sem perfil, redirecionando para login')
    return <Navigate to="/login" replace />
  }

  // Redirecionar baseado no role do usuário
  console.log('🏠 HomePage: Redirecionando baseado no role:', profile.role)
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
      console.log('🚨 HomePage: Role desconhecido, redirecionando para login')
      return <Navigate to="/login" replace />
  }
}

export default HomePage