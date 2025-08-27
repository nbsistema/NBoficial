import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()

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
            {error}. Verifique sua configuração do Supabase ou tente fazer login novamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect to login if no profile found
  if (!profile) {
    return <Navigate to="/login" replace />
  }

  // Redirect based on user role
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
      return <Navigate to="/login" replace />
  }
}

export default HomePage