import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ClipboardList, 
  Users, 
  Calendar, 
  CheckCircle,
  Plus,
  Eye,
  Clock
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface CheckupStats {
  totalBaterias: number
  totalFuncionarios: number
  solicitacoesPendentes: number
  solicitacoesConcluidas: number
}

interface SolicitacaoRecente {
  id: string
  status: string
  data_solicitacao: string
  data_conclusao: string | null
  observacao: string | null
  checkup: { nome: string }
  paciente: { nome: string }
}

export default function CheckupDashboard() {
  const [stats, setStats] = useState<CheckupStats>({
    totalBaterias: 0,
    totalFuncionarios: 0,
    solicitacoesPendentes: 0,
    solicitacoesConcluidas: 0
  })
  const [solicitacoesRecentes, setSolicitacoesRecentes] = useState<SolicitacaoRecente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.empresa_id) {
      loadDashboardData()
    }
  }, [profile])

  const loadDashboardData = async () => {
    if (!profile?.empresa_id) return

    try {
      setError(null)
      // Buscar estatísticas da empresa
      const [
        { count: totalBaterias } = { count: 0 },
        { count: totalFuncionarios } = { count: 0 },
        { count: solicitacoesPendentes } = { count: 0 },
        { count: solicitacoesConcluidas } = { count: 0 }
      ] = await Promise.all([
        supabase.from('checkups').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id),
        supabase.from('pacientes').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id),
        supabase
          .from('checkup_pacientes')
          .select('*, checkups!inner(*)', { count: 'exact', head: true })
          .eq('checkups.empresa_id', profile.empresa_id)
          .in('status', ['pendente', 'em_andamento']),
        supabase
          .from('checkup_pacientes')
          .select('*, checkups!inner(*)', { count: 'exact', head: true })
          .eq('checkups.empresa_id', profile.empresa_id)
          .eq('status', 'concluido')
      ])

      setStats({
        totalBaterias: totalBaterias || 0,
        totalFuncionarios: totalFuncionarios || 0,
        solicitacoesPendentes: solicitacoesPendentes || 0,
        solicitacoesConcluidas: solicitacoesConcluidas || 0
      })

      // Buscar solicitações recentes
      const { data: solicitacoes } = await supabase
        .from('checkup_pacientes')
        .select(`
          id,
          status,
          data_solicitacao,
          data_conclusao,
          observacao,
          checkups!inner(nome, empresa_id),
          pacientes!inner(nome)
        `)
        .eq('checkups.empresa_id', profile.empresa_id)
        .order('data_solicitacao', { ascending: false })
        .limit(10)

      setSolicitacoesRecentes(solicitacoes?.map(s => ({
        id: s.id,
        status: s.status,
        data_solicitacao: s.data_solicitacao,
        data_conclusao: s.data_conclusao,
        observacao: s.observacao,
        checkup: { nome: s.checkups.nome },
        paciente: { nome: s.pacientes.nome }
      })) || [])

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard checkup:', error)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={['checkup']}>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['checkup']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Check-up</h1>
          <p className="text-gray-600">Gerencie suas baterias de exames e funcionários</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Baterias de Check-up"
            value={stats.totalBaterias}
            icon={ClipboardList}
            description="Baterias cadastradas"
          />
          <StatsCard
            title="Funcionários"
            value={stats.totalFuncionarios}
            icon={Users}
            description="Total de funcionários"
          />
          <StatsCard
            title="Solicitações Pendentes"
            value={stats.solicitacoesPendentes}
            icon={Clock}
            description="Aguardando execução"
          />
          <StatsCard
            title="Concluídas"
            value={stats.solicitacoesConcluidas}
            icon={CheckCircle}
            description="Check-ups finalizados"
          />
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/checkup/baterias/nova">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Bateria
                </Button>
              </Link>
              <Link to="/checkup/funcionarios/novo">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Cadastrar Funcionário
                </Button>
              </Link>
              <Link to="/checkup/solicitacoes/nova">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Nova Solicitação
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Solicitações Recentes</CardTitle>
              <CardDescription>
                Últimas solicitações de check-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {solicitacoesRecentes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma solicitação encontrada
                  </p>
                ) : (
                  solicitacoesRecentes.map((solicitacao) => (
                    <div key={solicitacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{solicitacao.paciente.nome}</span>
                          {getStatusBadge(solicitacao.status)}
                        </div>
                        <p className="text-xs text-gray-600">
                          {solicitacao.checkup.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          Solicitado em {formatDateTime(solicitacao.data_solicitacao)}
                          {solicitacao.data_conclusao && (
                            <> • Concluído em {formatDateTime(solicitacao.data_conclusao)}</>
                          )}
                        </p>
                        {solicitacao.observacao && (
                          <p className="text-xs text-gray-600 mt-1">
                            Obs: {solicitacao.observacao}
                          </p>
                        )}
                      </div>
                      <Link to={`/checkup/solicitacoes/${solicitacao.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Pendências */}
        {stats.solicitacoesPendentes > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Clock className="h-5 w-5" />
                Solicitações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-3">
                Você tem {stats.solicitacoesPendentes} solicitações de check-up aguardando execução.
              </p>
              <Link to="/checkup/solicitacoes?status=pendente">
                <Button variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-100">
                  Ver Solicitações Pendentes
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
