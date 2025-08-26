'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (profile) {
        // Redirecionar baseado no role do usuário
        switch (profile.role) {
          case 'admin':
            router.push('/admin')
            break
          case 'ctr':
            router.push('/ctr')
            break
          case 'parceiro':
            router.push('/parceiro')
            break
          case 'checkup':
            router.push('/checkup')
            break
          default:
            router.push('/login')
        }
      }
    }
  }, [user, profile, loading, router])

  return <Loading />
}