import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Building2, 
  FileText, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  Home,
  Stethoscope,
  ClipboardList
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalEncaminhamentos: number
  executados: number
  intervencoes: number
  acompanhamentos: number
  totalEmpresas: number
  totalPacientes: number
  encaminhamentosHoje: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEncaminhamentos: 0,
    executados: 0,
    intervencoes: 0,
    acompanhamentos: 0,
    totalEmpresas: 0,
    totalPacientes: 0,
    encaminhamentosHoje: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setError(null)
      // Buscar estatísticas gerais
      const [
        totalEncaminhamentosResult,
        executadosResult,
        intervencoesResult,
        acompanhamentosResult,
        totalEmpresasResult,
        totalPacientesResult
      ] = await Promise.all([
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'executado'),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'intervencao'),
        supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'acompanhamento'),
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('pacientes').select('*', { count: 'exact', head: true })
      ])

      // Encaminhamentos de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const encaminhamentosHojeResult = await supabase
        .from('encaminhamentos')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoje)

      setStats({
        totalEncaminhamentos: totalEncaminhamentosResult.count || 0,
        executados: executadosResult.count || 0,
        intervencoes: intervencoesResult.count || 0,
        acompanhamentos: acompanhamentosResult.count || 0,
        totalEmpresas: totalEmpresasResult.count || 0,
        totalPacientes: totalPacientesResult.count || 0,
        encaminhamentosHoje: encaminhamentosHojeResult.count || 0
      })

      // Dados para gráfico de barras (últimos 7 dias)
      const { data: encaminhamentosRecentes } = await supabase
        .from('encaminhamentos')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      // Processar dados para o gráfico
      const chartDataMap = new Map<string, { date: string; total: number; executados: number; intervencoes: number }>()
      encaminhamentosRecentes?.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('pt-BR')
        if (!chartDataMap.has(date)) {
          chartDataMap.set(date, { date, total: 0, executados: 0, intervencoes: 0 })
        }
        const dayData = chartDataMap.get(date)!
        dayData.total++
        if (item.status === 'executado') dayData.executados++
        if (item.status === 'intervencao') dayData.intervencoes++
      })

      setChartData(Array.from(chartDataMap.values()))

      // Dados para gráfico de pizza
      setPieData([
        { name: 'Executados', value: executadosResult.count || 0 },
        { name: 'Intervenções', value: intervencoesResult.count || 0 },
        { name: 'Acompanhamento', value: acompanhamentosResult.count || 0 },
        { name: 'Encaminhados', value: (totalEncaminhamentosResult.count || 0) - (executadosResult.count || 0) - (intervencoesResult.count || 0) - (acompanhamentosResult.count || 0) }
      ])

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral do sistema CTR</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Encaminhamentos"
            value={stats.totalEncaminhamentos}
            icon={FileText}
            description="Todos os encaminhamentos"
          />
          <StatsCard
            title="Executados"
            value={stats.executados}
            icon={CheckCircle}
            description="Exames realizados"
          />
          <StatsCard
            title="Intervenções"
            value={stats.intervencoes}
            icon={AlertTriangle}
            description="Casos que precisam de atenção"
          />
          <StatsCard
            title="Em Acompanhamento"
            value={stats.acompanhamentos}
            icon={Activity}
            description="Pacientes em follow-up"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Empresas Cadastradas"
            value={stats.totalEmpresas}
            icon={Building2}
            description="Parceiros e check-ups"
          />
          <StatsCard
            title="Total de Pacientes"
            value={stats.totalPacientes}
            icon={Users}
            description="Pacientes no sistema"
          />
          <StatsCard
            title="Encaminhamentos Hoje"
            value={stats.encaminhamentosHoje}
            icon={Calendar}
            description="Novos hoje"
          />
          <StatsCard
            title="Taxa de Execução"
            value={`${stats.totalEncaminhamentos > 0 ? Math.round((stats.executados / stats.totalEncaminhamentos) * 100) : 0}%`}
            icon={TrendingUp}
            description="Percentual executado"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido - CTR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/ctr">
                <Button className="w-full justify-start" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard CTR
                </Button>
              </Link>
              <Link to="/ctr/pedidos">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerenciar Pedidos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido - Parceiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/parceiro">
                <Button className="w-full justify-start" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard Parceiro
                </Button>
              </Link>
              <Link to="/parceiro/medicos">
                <Button className="w-full justify-start" variant="outline">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Gerenciar Médicos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acesso Rápido - Check-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/checkup">
                <Button className="w-full justify-start" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard Check-up
                </Button>
              </Link>
              <Link to="/checkup/baterias">
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Gerenciar Baterias
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Encaminhamentos - Últimos 7 dias</CardTitle>
              <CardDescription>
                Evolução diária dos encaminhamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" name="Total" />
                  <Bar dataKey="executados" fill="#82ca9d" name="Executados" />
                  <Bar dataKey="intervencoes" fill="#ffc658" name="Intervenções" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Encaminhamentos</CardTitle>
              <CardDescription>
                Distribuição por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Intervenções */}
        {stats.intervencoes > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Casos em Intervenção
              </CardTitle>
              <CardDescription>
                {stats.intervencoes} casos precisam de atenção especial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Existem {stats.intervencoes} encaminhamentos marcados como intervenção que requerem acompanhamento especial.
                Acesse a seção de relatórios para mais detalhes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}