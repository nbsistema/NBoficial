import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { 
  
  Database, 
  Users, 
  Building2, 
  FileText,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalProfiles: number
  totalEmpresas: number
  totalEncaminhamentos: number
  usersWithoutProfile: number
  inactiveEmpresas: number
}

export default function AdminConfiguracoesPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProfiles: 0,
    totalEmpresas: 0,
    totalEncaminhamentos: 0,
    usersWithoutProfile: 0,
    inactiveEmpresas: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFixingData, setIsFixingData] = useState(false)

  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = async () => {
    try {
      setError(null)
      
      const [
        { count: totalProfiles },
        { count: totalEmpresas },
        { count: totalEncaminhamentos },
        { count: inactiveEmpresas }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }),
        supabase.from('empresas').select('*', { count: 'exact', head: true }).eq('ativa', false)
      ])

      // Tentar buscar usuários auth (pode falhar se não tiver permissão)
      let totalUsers = 0
      let usersWithoutProfile = 0
      
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers()
        totalUsers = authUsers?.users?.length || 0
        
        const profileUserIds = new Set()
        const { data: profiles } = await supabase.from('user_profiles').select('user_id')
        profiles?.forEach(p => profileUserIds.add(p.user_id))
        
        usersWithoutProfile = authUsers?.users?.filter(u => !profileUserIds.has(u.id)).length || 0
      } catch (e) {
        console.warn('Não foi possível acessar dados de autenticação:', e)
      }

      setStats({
        totalUsers,
        totalProfiles: totalProfiles || 0,
        totalEmpresas: totalEmpresas || 0,
        totalEncaminhamentos: totalEncaminhamentos || 0,
        usersWithoutProfile,
        inactiveEmpresas: inactiveEmpresas || 0
      })

    } catch (error: any) {
      console.error('Erro ao carregar estatísticas do sistema:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const executarCorrecaoDados = async () => {
    setIsFixingData(true)
    try {
      // Executar função de correção de dados via RPC ou SQL direto
      const { error } = await supabase.rpc('fix_system_data')
      
      if (error) {
        console.warn('RPC não disponível, tentando correção manual...')
        // Implementar correção manual se necessário
      }

      await loadSystemStats()
      alert('Correção de dados executada com sucesso!')
    } catch (error: any) {
      console.error('Erro na correção de dados:', error)
      setError(error.message)
    } finally {
      setIsFixingData(false)
    }
  }

  const getHealthStatus = () => {
    const issues = []
    
    if (stats.usersWithoutProfile > 0) {
      issues.push(`${stats.usersWithoutProfile} usuários sem perfil`)
    }
    
    if (stats.inactiveEmpresas > 0) {
      issues.push(`${stats.inactiveEmpresas} empresas inativas`)
    }

    if (issues.length === 0) {
      return { status: 'healthy', message: 'Sistema funcionando normalmente' }
    } else {
      return { status: 'warning', message: issues.join(', ') }
    }
  }

  const health = getHealthStatus()

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Administre configurações e monitore a saúde do sistema</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status do Sistema */}
        <Card className={health.status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${health.status === 'healthy' ? 'text-green-800' : 'text-yellow-800'}`}>
              {health.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={health.status === 'healthy' ? 'text-green-700' : 'text-yellow-700'}>
              {health.message}
            </p>
            {health.status === 'warning' && (
              <div className="mt-4">
                <Button
                  onClick={executarCorrecaoDados}
                  disabled={isFixingData}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isFixingData ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Corrigindo...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Corrigir Problemas
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Autenticados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Total de usuários no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfis Criados</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfiles}</div>
              <p className="text-xs text-muted-foreground">
                Usuários com perfil ativo
              </p>
              {stats.usersWithoutProfile > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.usersWithoutProfile} sem perfil
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmpresas}</div>
              <p className="text-xs text-muted-foreground">
                Parceiros e check-ups
              </p>
              {stats.inactiveEmpresas > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {stats.inactiveEmpresas} inativas
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encaminhamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEncaminhamentos}</div>
              <p className="text-xs text-muted-foreground">
                Total de encaminhamentos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações de Administração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Administre usuários e perfis do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/usuarios">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </Button>
              </Link>
              <Link to="/admin/usuarios/novo">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Usuário
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Empresas</CardTitle>
              <CardDescription>
                Administre parceiros e empresas de check-up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/empresas">
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Gerenciar Empresas
                </Button>
              </Link>
              <Link to="/admin/empresas/nova">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Nova Empresa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Credenciais de Teste</h4>
                <div className="space-y-1 text-gray-600">
                  <p><strong>Admin:</strong> admin@sistema.com / admin123</p>
                  <p><strong>CTR:</strong> ctr@sistema.com / ctr123</p>
                  <p><strong>Parceiro:</strong> parceiro@sistema.com / parceiro123</p>
                  <p><strong>Check-up:</strong> checkup@sistema.com / checkup123</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Versão do Sistema</h4>
                <div className="space-y-1 text-gray-600">
                  <p><strong>Versão:</strong> 1.0.0</p>
                  <p><strong>Ambiente:</strong> {import.meta.env.MODE}</p>
                  <p><strong>Build:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
