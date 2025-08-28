import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()

  console.log('HomePage render:', { 
    user: user?.id ? 'exists' : 'null', 
    profile: profile?.role || 'null', 
    loading, 
    error 
  })

  // Show loading while checking authentication
  if (loading) {
    console.log('HomePage: showing loading')
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
    console.log('HomePage: showing error:', error)
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

  // Redirect to login if not authenticated
  if (!user) {
    console.log('HomePage: no user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Redirect to login if no profile found
  if (!profile) {
    console.log('HomePage: no profile, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Redirect based on user role
  console.log('HomePage: redirecting based on role:', profile.role)
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
      console.log('HomePage: unknown role, redirecting to login')
      return <Navigate to="/login" replace />
  }
}

export default HomePage