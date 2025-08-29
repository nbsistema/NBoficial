import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Users
} from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface CTRStats {
  pedidosPendentes: number
  executadosHoje: number
  totalIntervencoes: number
  pedidosHoje: number
}

interface PedidoRecente {
  id: string
  status: string
  created_at: string
  paciente: { nome: string }
  medico: { nome: string, empresa: { nome: string } }
  exame: { nome: string }
}

export default function CTRDashboard() {
  const [stats, setStats] = useState<CTRStats>({
    pedidosPendentes: 0,
    executadosHoje: 0,
    totalIntervencoes: 0,
    pedidosHoje: 0
  })
  const [pedidosRecentes, setPedidosRecentes] = useState<PedidoRecente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      const hoje = new Date().toISOString().split('T')[0]

      // Buscar estatísticas
      const [
        { count: pedidosPendentes },
        { count: executadosHoje },
        { count: totalIntervencoes },
        { count: pedidosHoje }
      ] = await Promise.all([
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'encaminhado'),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'executado').gte('data_execucao', hoje),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'intervencao'),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).gte('created_at', hoje)
      ])

      setStats({
        pedidosPendentes: pedidosPendentes || 0,
        executadosHoje: executadosHoje || 0,
        totalIntervencoes: totalIntervencoes || 0,
        pedidosHoje: pedidosHoje || 0
      })

      // Buscar pedidos recentes
      const { data: pedidos } = await supabase
        .from('encaminhamentos')
        .select(`
          id,
          status,
          created_at,
          pacientes!inner(nome),
          medicos!inner(nome, empresas!inner(nome)),
          exames!inner(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setPedidosRecentes(pedidos?.map(p => ({
        id: p.id,
        status: p.status,
        created_at: p.created_at,
        paciente: { nome: p.pacientes.nome },
        medico: { 
          nome: p.medicos.nome, 
          empresa: { nome: p.medicos.empresas.nome }
        },
        exame: { nome: p.exames.nome }
      })) || [])

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard CTR:', error)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={['ctr']}>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout allowedRoles={['ctr', 'admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard CTR</h1>
          <p className="text-gray-600">Gestão de pedidos e execução de exames</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pedidos Pendentes"
            value={stats.pedidosPendentes}
            icon={Clock}
            description="Aguardando execução"
          />
          <StatsCard
            title="Executados Hoje"
            value={stats.executadosHoje}
            icon={CheckCircle}
            description="Exames realizados hoje"
          />
          <StatsCard
            title="Intervenções"
            value={stats.totalIntervencoes}
            icon={AlertTriangle}
            description="Casos que precisam atenção"
          />
          <StatsCard
            title="Pedidos Hoje"
            value={stats.pedidosHoje}
            icon={Calendar}
            description="Novos pedidos hoje"
          />
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/ctr/pedidos">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Todos os Pedidos
                </Button>
              </Link>
              <Link to="/ctr/empresas">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Empresas
                </Button>
              </Link>
              <Link to="/ctr/relatorios">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatórios
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>
                Últimos 10 encaminhamentos recebidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pedidosRecentes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum pedido encontrado
                  </p>
                ) : (
                  pedidosRecentes.map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{pedido.paciente.nome}</span>
                          <Badge className={getStatusColor(pedido.status)}>
                            {getStatusLabel(pedido.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {pedido.exame.nome} • {pedido.medico.nome} • {pedido.medico.empresa.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(pedido.created_at)}
                        </p>
                      </div>
                      <Link to={`/ctr/pedidos/${pedido.id}`}>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {stats.totalIntervencoes > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Atenção: Casos em Intervenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-3">
                Existem {stats.totalIntervencoes} casos marcados como intervenção que precisam de acompanhamento especial.
              </p>
              <Link to="/ctr/pedidos?status=intervencao">
                <Button variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                  Ver Casos de Intervenção
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}