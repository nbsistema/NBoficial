'use client'

import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  allowedRoles?: Array<'admin' | 'ctr' | 'parceiro' | 'checkup'>
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user || !profile) {
    redirect('/login')
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}