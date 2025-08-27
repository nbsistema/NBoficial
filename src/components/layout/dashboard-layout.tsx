import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Loading } from '@/components/ui/loading'

interface DashboardLayoutProps {
  children: ReactNode
  allowedRoles: Array<'admin' | 'ctr' | 'parceiro' | 'checkup'>
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login')
        return
      }

      if (!profile) {
        navigate('/login')
        return
      }

      if (!allowedRoles.includes(profile.role)) {
        navigate('/unauthorized')
        return
      }
    }
  }, [user, profile, loading, allowedRoles, navigate])

  if (loading) {
    return <Loading />
  }

  if (!user || !profile || !allowedRoles.includes(profile.role)) {
    return <Loading />
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