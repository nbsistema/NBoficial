import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()
  const { user, profile, loading, error, signIn } = useAuth()

  // Redirecionar se já autenticado
  useEffect(() => {
    console.log('🔐 LoginPage: Verificando autenticação:', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role
    })
    
    if (!loading && user && profile) {
      console.log('🔐 LoginPage: Usuário já autenticado, redirecionando...')
      switch (profile.role) {
        case 'admin':
          navigate('/admin', { replace: true })
          break
        case 'ctr':
          navigate('/ctr', { replace: true })
          break
        case 'parceiro':
          navigate('/parceiro', { replace: true })
          break
        case 'checkup':
          navigate('/checkup', { replace: true })
          break
        default:
          navigate('/', { replace: true })
      }
    }
  }, [user, profile, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setLoginError('')

    try {
      console.log('🔐 LoginPage: Iniciando login para:', email)
      
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error('🚨 LoginPage: Erro no login:', signInError)
        setLoginError(signInError.message || 'Erro ao fazer login')
        return
      }

      console.log('✅ LoginPage: Login iniciado com sucesso')
      // O redirecionamento será feito pelo useEffect quando o estado mudar
      
    } catch (error: any) {
      console.error('🚨 LoginPage: Exceção no login:', error)
      setLoginError('Erro inesperado ao fazer login')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar loading se verificando estado de auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sistema CTR
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {(loginError || error) && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError || error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Sistema de Gestão CTR - Versão 1.0
          </p>
        </div>
      </div>
    </div>
  )
}