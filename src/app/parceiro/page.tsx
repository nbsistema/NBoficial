'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { createSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Stethoscope, 
  Activity,
  Plus,
  Eye
} from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'

interface ParceiroStats {
  totalEncaminhamentos: number
  executados: number
  intervencoes: number
  acompanhamentos: number
  totalMedicos: number
  totalConvenios: number
}

interface EncaminhamentoRecente {
  id: string
  status: string
  created_at: string
  data_execucao: string | null
  paciente: { nome: string }
  medico: { nome: string }
  exame: { nome: string }
  detalhes_intervencao: string | null
}

export default function ParceiroDashboard() {
  const [stats, setStats] = useState<ParceiroStats>({
    totalEncaminhamentos: 0,
    executados: 0,
    intervencoes: 0,
    acompanhamentos: 0,
    totalMedicos: 0,
    totalConvenios: 0
  })
  const [encaminhamentosRecentes, setEncaminhamentosRecentes] = useState<EncaminhamentoRecente[]>([])
  const [loading, setLoading] = useState(true)

  const { profile } = useAuth()
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (profile?.empresa_id) {
      loadDashboardData()
    }
  }, [profile])

  const loadDashboardData = async () => {
    if (!profile?.empresa_id) return

    try {
      // Buscar estatísticas da empresa
      const [
        { count: totalMedicos },
        { count: totalConvenios }
      ] = await Promise.all([
        supabase.from('medicos').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id),
        supabase.from('convenios').select('*', { count: 'exact', head: true }).eq('empresa_id', profile.empresa_id)
      ])

      // Buscar encaminhamentos da empresa
      const { data: medicosIds } = await supabase
        .from('medicos')
        .select('id')
        .eq('empresa_id', profile.empresa_id)

      if (medicosIds && medicosIds.length > 0) {
        const medicosIdsList = medicosIds.map(m => m.id)

        const [
          { count: totalEncaminhamentos },
          { count: executados },
          { count: intervencoes },
          { count: acompanhamentos }
        ] = await Promise.all([
          supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).in('medico_id', medicosIdsList),
          supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).in('medico_id', medicosIdsList).eq('status', 'executado'),
          supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).in('medico_id', medicosIdsList).eq('status', 'intervencao'),
          supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).in('medico_id', medicosIdsList).eq('status', 'acompanhamento')
        ])

        setStats({
          totalEncaminhamentos: totalEncaminhamentos || 0,
          executados: executados || 0,
          intervencoes: intervencoes || 0,
          acompanhamentos: acompanhamentos || 0,
          totalMedicos: totalMedicos || 0,
          totalConvenios: totalConvenios || 0
        })

        // Buscar encaminhamentos recentes
        const { data: encaminhamentos } = await supabase
          .from('encaminhamentos')
          .select(`
            id,
            status,
            created_at,
            data_execucao,
            detalhes_intervencao,
            pacientes!inner(nome),
            medicos!inner(nome),
            exames!inner(nome)
          `)
          .in('medico_id', medicosIdsList)
          .order('created_at', { ascending: false })
          .limit(10)

        setEncaminhamentosRecentes(encaminhamentos?.map(e => ({
          id: e.id,
          status: e.status,
          created_at: e.created_at,
          data_execucao: e.data_execucao,
          detalhes_intervencao: e.detalhes_intervencao,
          paciente: { nome: e.pacientes.nome },
          medico: { nome: e.medicos.nome },
          exame: { nome: e.exames.nome }
        })) || [])
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard parceiro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={['parceiro']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Parceiro</h1>
          <p className="text-gray-600">Acompanhe seus encaminhamentos e pacientes</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Total de Encaminhamentos"
            value={stats.totalEncaminhamentos}
            icon={FileText}
            description="Todos os seus encaminhamentos"
          />
          <StatsCard
            title="Executados"
            value={stats.executados}
            icon={Activity}
            description="Exames realizados"
          />
          <StatsCard
            title="Médicos Cadastrados"
            value={stats.totalMedicos}
            icon={Stethoscope}
            description="Médicos da sua empresa"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Intervenções"
            value={stats.intervencoes}
            icon={Activity}
            description="Casos que precisam atenção"
          />
          <StatsCard
            title="Acompanhamentos"
            value={stats.acompanhamentos}
            icon={Users}
            description="Pacientes em follow-up"
          />
          <StatsCard
            title="Convênios"
            value={stats.totalConvenios}
            icon={Activity}
            description="Convênios cadastrados"
          />
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/parceiro/encaminhamentos/novo">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Encaminhamento
                </Button>
              </Link>
              <Link href="/parceiro/medicos">
                <Button className="w-full justify-start" variant="outline">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Gerenciar Médicos
                </Button>
              </Link>
              <Link href="/parceiro/convenios">
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Gerenciar Convênios
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Encaminhamentos Recentes</CardTitle>
              <CardDescription>
                Últimos encaminhamentos da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {encaminhamentosRecentes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum encaminhamento encontrado
                  </p>
                ) : (
                  encaminhamentosRecentes.map((encaminhamento) => (
                    <div key={encaminhamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{encaminhamento.paciente.nome}</span>
                          <Badge className={getStatusColor(encaminhamento.status)}>
                            {getStatusLabel(encaminhamento.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {encaminhamento.exame.nome} • Dr(a). {encaminhamento.medico.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          Criado em {formatDateTime(encaminhamento.created_at)}
                          {encaminhamento.data_execucao && (
                            <> • Executado em {formatDateTime(encaminhamento.data_execucao)}</>
                          )}
                        </p>
                        {encaminhamento.status === 'intervencao' && encaminhamento.detalhes_intervencao && (
                          <p className="text-xs text-yellow-700 mt-1 font-medium">
                            Intervenção: {encaminhamento.detalhes_intervencao}
                          </p>
                        )}
                      </div>
                      <Link href={`/parceiro/pacientes/${encaminhamento.id}`}>
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

        {/* Alertas */}
        {stats.intervencoes > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Activity className="h-5 w-5" />
                Casos em Intervenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-3">
                Você tem {stats.intervencoes} casos marcados como intervenção que precisam de acompanhamento.
              </p>
              <Link href="/parceiro/pacientes?status=intervencao">
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