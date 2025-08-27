import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loading } from '../components/ui/loading'

const HomePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            {error}. Please check your Supabase configuration.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

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