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

  // Redirect if already authenticated (com timeout de segurança)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    console.log('🔐 LoginPage: useEffect - verificando autenticação:', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile,
      profileRole: profile?.role
    })
    
    // Timeout de segurança
    timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ LoginPage: Timeout na verificação de autenticação')
        // Não fazer nada, deixar o usuário na tela de login
      }
    }, 10000)
    
    if (!loading && user && profile) {
      clearTimeout(timeoutId)
      console.log('🔐 LoginPage: Usuário já autenticado, redirecionando para:', profile.role)
      switch (profile.role) {
        case 'admin':
          console.log('🔐 LoginPage: Redirecionando para /admin')
          navigate('/admin', { replace: true })
          break
        case 'ctr':
          console.log('🔐 LoginPage: Redirecionando para /ctr')
          navigate('/ctr', { replace: true })
          break
        case 'parceiro':
          console.log('🔐 LoginPage: Redirecionando para /parceiro')
          navigate('/parceiro', { replace: true })
          break
        case 'checkup':
          console.log('🔐 LoginPage: Redirecionando para /checkup')
          navigate('/checkup', { replace: true })
          break
        default:
          console.log('🔐 LoginPage: Role desconhecido, redirecionando para /')
          navigate('/', { replace: true })
      }
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [user, profile, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 LoginPage: Iniciando processo de login')
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setLoginError('')

    try {
      console.log('🔐 LoginPage: Tentando login para:', email)
      
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error('🚨 LoginPage: Erro no login:', signInError)
        setLoginError(signInError.message || 'Erro ao fazer login')
        return
      }

      console.log('✅ LoginPage: Login bem-sucedido, aguardando mudança de estado...')
      
    } catch (error: any) {
      console.error('🚨 LoginPage: Exceção no login:', error)
      setLoginError('Erro inesperado ao fazer login')
    } finally {
      console.log('🔐 LoginPage: Finalizando processo de login')
      setIsSubmitting(false)
    }
  }

  // Show loading if checking auth state
  if (loading && !error) {
    console.log('🔐 LoginPage: Mostrando loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Carregando sistema...</p>
          <p className="text-xs text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    )
  }

  console.log('🔐 LoginPage: Renderizando formulário de login')

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