import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { Plus, User, Building2, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/utils'

interface Usuario {
  id: string
  user_id: string
  role: 'admin' | 'ctr' | 'parceiro' | 'checkup'
  empresa_id: string | null
  nome: string
  created_at: string
  updated_at: string
  empresa?: {
    nome: string
    tipo: string
  }
}

interface UsuarioSemPerfil {
  id: string
  email: string
  created_at: string
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuariosSemPerfil, setUsuariosSemPerfil] = useState<UsuarioSemPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsuarios()
    loadUsuariosSemPerfil()
  }, [])

  const loadUsuarios = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          empresas(nome, tipo)
        `)
        .order('nome')

      if (error) throw error
      setUsuarios(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error)
      setError(error.message)
    }
  }

  const loadUsuariosSemPerfil = async () => {
    try {
      // Buscar usuários autenticados que não têm perfil
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.warn('Não foi possível acessar lista de usuários auth:', authError)
        return
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id')

      if (profilesError) throw profilesError

      const profileUserIds = new Set(profiles?.map(p => p.user_id) || [])
      
      const usuariosSemPerfil = authUsers.users
        .filter(user => !profileUserIds.has(user.id))
        .map(user => ({
          id: user.id,
          email: user.email || 'Email não disponível',
          created_at: user.created_at
        }))

      setUsuariosSemPerfil(usuariosSemPerfil)
    } catch (error: any) {
      console.error('Erro ao carregar usuários sem perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Administrador</Badge>
      case 'ctr':
        return <Badge className="bg-blue-100 text-blue-800">CTR</Badge>
      case 'parceiro':
        return <Badge className="bg-green-100 text-green-800">Parceiro</Badge>
      case 'checkup':
        return <Badge className="bg-orange-100 text-orange-800">Check-up</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const criarPerfilFicticio = async (userId: string, email: string) => {
    try {
      // Determinar role baseado no email ou criar como CTR por padrão
      let role: 'admin' | 'ctr' | 'parceiro' | 'checkup' = 'ctr'
      let nome = 'Usuário Teste'
      let empresa_id = null

      if (email.includes('admin')) {
        role = 'admin'
        nome = 'Admin Teste'
      } else if (email.includes('parceiro')) {
        role = 'parceiro'
        nome = 'Parceiro Teste'
        // Buscar primeira empresa parceiro
        const { data: empresa } = await supabase
          .from('empresas')
          .select('id')
          .eq('tipo', 'parceiro')
          .limit(1)
          .single()
        empresa_id = empresa?.id || null
      } else if (email.includes('checkup')) {
        role = 'checkup'
        nome = 'Check-up Teste'
        // Buscar primeira empresa checkup
        const { data: empresa } = await supabase
          .from('empresas')
          .select('id')
          .eq('tipo', 'checkup')
          .limit(1)
          .single()
        empresa_id = empresa?.id || null
      }

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          role,
          nome,
          empresa_id
        })

      if (error) throw error

      await loadUsuarios()
      await loadUsuariosSemPerfil()
    } catch (error: any) {
      console.error('Erro ao criar perfil:', error)
      setError(error.message)
    }
  }

  const deleteUsuario = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadUsuarios()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      setError(error.message)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p className="text-gray-600">Administre perfis e permissões de usuários</p>
          </div>
          <Link to="/admin/usuarios/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Usuários sem perfil */}
        {usuariosSemPerfil.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Usuários sem Perfil ({usuariosSemPerfil.length})
              </CardTitle>
              <CardDescription>
                Usuários autenticados que não possuem perfil no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usuariosSemPerfil.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{usuario.email}</p>
                      <p className="text-xs text-gray-500">
                        Criado em {formatDateTime(usuario.created_at)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => criarPerfilFicticio(usuario.id, usuario.email)}
                    >
                      Criar Perfil
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de usuários com perfil */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usuarios.map((usuario) => (
            <Card key={usuario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {getRoleBadge(usuario.role)}
                    </div>
                  </div>
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuario.empresa && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>{usuario.empresa.nome}</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>Criado em {formatDateTime(usuario.created_at)}</p>
                  <p>Atualizado em {formatDateTime(usuario.updated_at)}</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Link to={`/admin/usuarios/${usuario.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  {usuario.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {usuarios.length === 0 && usuariosSemPerfil.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando o primeiro usuário do sistema
              </p>
              <Link to="/admin/usuarios/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Usuário
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}