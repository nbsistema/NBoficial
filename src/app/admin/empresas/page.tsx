import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { Plus, Building2, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCNPJ } from '@/lib/utils'

interface Empresa {
  id: string
  nome: string
  tipo: 'parceiro' | 'checkup'
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  ativa: boolean
  created_at: string
  updated_at: string
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome')

      if (error) throw error
      setEmpresas(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar empresas:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleEmpresaStatus = async (id: string, ativa: boolean) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ ativa: !ativa })
        .eq('id', id)

      if (error) throw error
      await loadEmpresas()
    } catch (error: any) {
      console.error('Erro ao alterar status da empresa:', error)
      setError(error.message)
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'parceiro':
        return <Badge className="bg-blue-100 text-blue-800">Parceiro</Badge>
      case 'checkup':
        return <Badge className="bg-green-100 text-green-800">Check-up</Badge>
      default:
        return <Badge>{tipo}</Badge>
    }
  }

  const getStatusBadge = (ativa: boolean) => {
    return ativa 
      ? <Badge className="bg-green-100 text-green-800">Ativa</Badge>
      : <Badge className="bg-red-100 text-red-800">Inativa</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando empresas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Empresas</h1>
            <p className="text-gray-600">Administre parceiros e empresas de check-up</p>
          </div>
          <Link to="/admin/empresas/nova">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {getTipoBadge(empresa.tipo)}
                      {getStatusBadge(empresa.ativa)}
                    </div>
                  </div>
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {empresa.cnpj && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{formatCNPJ(empresa.cnpj)}</span>
                  </div>
                )}
                
                {empresa.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{empresa.telefone}</span>
                  </div>
                )}
                
                {empresa.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{empresa.email}</span>
                  </div>
                )}
                
                {empresa.endereco && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-2">{empresa.endereco}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Link to={`/admin/empresas/${empresa.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEmpresaStatus(empresa.id, empresa.ativa)}
                    className={empresa.ativa ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {empresa.ativa ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {empresas.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma empresa cadastrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando a primeira empresa do sistema
              </p>
              <Link to="/admin/empresas/nova">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeira Empresa
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}