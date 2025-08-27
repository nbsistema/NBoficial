import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/loading'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login')
      } else if (profile) {
        // Redirecionar baseado no role do usuário
        switch (profile.role) {
          case 'admin':
            navigate('/admin')
            break
          case 'ctr':
            navigate('/ctr')
            break
          case 'parceiro':
            navigate('/parceiro')
            break
          case 'checkup':
            navigate('/checkup')
            break
          default:
            navigate('/login')
        }
      }
    }
  }, [user, profile, loading, navigate])

  return <Loading />
}