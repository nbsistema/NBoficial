import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, Phone, Mail, Edit, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmModal } from '@/components/ui/modal'
import { useToast } from '@/hooks/useToast'
import { empresaService } from '@/services/api'
import { formatCNPJ, formatPhone } from '@/lib/formatters'
import { MESSAGES } from '@/lib/constants'
import type { Empresa } from '@/types'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; empresa?: Empresa }>({
    isOpen: false
  })
  const { success, error } = useToast()

  useEffect(() => {
    loadEmpresas()
  }, [])

  const loadEmpresas = async () => {
    try {
      setLoading(true)
      const data = await empresaService.getAll()
      setEmpresas(data)
    } catch (err) {
      error('Erro ao carregar empresas', 'Tente novamente mais tarde')
      console.error('Erro ao carregar empresas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (empresa: Empresa) => {
    try {
      await empresaService.toggleStatus(empresa.id)
      success(
        empresa.ativa ? 'Empresa desativada' : 'Empresa ativada',
        `${empresa.nome} foi ${empresa.ativa ? 'desativada' : 'ativada'} com sucesso`
      )
      loadEmpresas()
    } catch (err) {
      error('Erro ao alterar status', 'Tente novamente mais tarde')
      console.error('Erro ao alterar status:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.empresa) return

    try {
      await empresaService.delete(deleteModal.empresa.id)
      success(MESSAGES.SUCCESS.DELETED, `${deleteModal.empresa.nome} foi excluída`)
      loadEmpresas()
    } catch (err) {
      error('Erro ao excluir empresa', 'Verifique se não há dados vinculados')
      console.error('Erro ao excluir empresa:', err)
    }
  }

  const columns = [
    {
      key: 'nome',
      title: 'Nome',
      sortable: true,
      render: (value: string, empresa: Empresa) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 capitalize">
            {empresa.tipo === 'parceiro' ? 'Parceiro' : 'Check-up'}
          </div>
        </div>
      )
    },
    {
      key: 'cnpj',
      title: 'CNPJ',
      render: (value: string) => value ? formatCNPJ(value) : '-'
    },
    {
      key: 'telefone',
      title: 'Contato',
      render: (value: string, empresa: Empresa) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {formatPhone(value)}
            </div>
          )}
          {empresa.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {empresa.email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'ativa',
      title: 'Status',
      render: (value: boolean) => (
        <StatusBadge 
          status={value ? 'ativo' : 'inativo'} 
          type="empresa" 
        />
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '120px',
      render: (_: any, empresa: Empresa) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/empresas/${empresa.id}`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(empresa)}
            className={empresa.ativa ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {empresa.ativa ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ isOpen: true, empresa })}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout requireAdmin={true}>
      <PageHeader
        title="Empresas"
        description="Gerencie parceiros e empresas de check-up"
      >
        <Link to="/admin/empresas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </Link>
      </PageHeader>

      {empresas.length === 0 && !loading ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma empresa cadastrada"
          description="Comece cadastrando a primeira empresa do sistema"
          action={
            <Link to="/admin/empresas/nova">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeira Empresa
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={empresas}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Buscar empresas..."
          exportable
          emptyMessage="Nenhuma empresa encontrada"
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir a empresa "${deleteModal.empresa?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </DashboardLayout>
  )
}