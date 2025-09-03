import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormLabel, FormError } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/useToast'
import { empresaService } from '@/services/api'
import { validateEmpresaForm } from '@/lib/validations'
import { maskCNPJ, maskPhone } from '@/lib/formatters'
import { MESSAGES, TIPO_EMPRESA } from '@/lib/constants'
import type { EmpresaForm } from '@/types'

export default function EmpresaFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  
  const [formData, setFormData] = useState<EmpresaForm>({
    nome: '',
    tipo: 'parceiro',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    ativa: true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)
  
  const { success, error } = useToast()

  useEffect(() => {
    if (isEditing && id) {
      loadEmpresa(id)
    }
  }, [id, isEditing])

  const loadEmpresa = async (empresaId: string) => {
    try {
      setLoadingData(true)
      const empresa = await empresaService.getById(empresaId)
      if (empresa) {
        setFormData(empresa)
      } else {
        error('Empresa não encontrada')
        navigate('/admin/empresas')
      }
    } catch (err) {
      error('Erro ao carregar empresa')
      console.error('Erro ao carregar empresa:', err)
      navigate('/admin/empresas')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (field: keyof EmpresaForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCNPJChange = (value: string) => {
    const masked = maskCNPJ(value)
    handleInputChange('cnpj', masked)
  }

  const handlePhoneChange = (value: string) => {
    const masked = maskPhone(value)
    handleInputChange('telefone', masked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulário
    const validationErrors = validateEmpresaForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      
      if (isEditing && id) {
        await empresaService.update(id, formData)
        success(MESSAGES.SUCCESS.UPDATED, 'Empresa atualizada com sucesso')
      } else {
        await empresaService.create(formData)
        success(MESSAGES.SUCCESS.CREATED, 'Empresa criada com sucesso')
      }
      
      navigate('/admin/empresas')
    } catch (err) {
      error(
        isEditing ? 'Erro ao atualizar empresa' : 'Erro ao criar empresa',
        'Verifique os dados e tente novamente'
      )
      console.error('Erro ao salvar empresa:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados da empresa...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader
        title={isEditing ? 'Editar Empresa' : 'Nova Empresa'}
        description={isEditing ? 'Atualize os dados da empresa' : 'Cadastre uma nova empresa no sistema'}
        showBackButton
        backTo="/admin/empresas"
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Dados da Empresa' : 'Informações da Empresa'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField className="md:col-span-2">
                  <FormLabel htmlFor="nome" required>Nome da Empresa</FormLabel>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite o nome da empresa"
                  />
                  <FormError message={errors.nome} />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="tipo" required>Tipo</FormLabel>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleInputChange('tipo', value as 'parceiro' | 'checkup')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TIPO_EMPRESA.PARCEIRO}>Parceiro</SelectItem>
                      <SelectItem value={TIPO_EMPRESA.CHECKUP}>Check-up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormError message={errors.tipo} />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="cnpj">CNPJ</FormLabel>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleCNPJChange(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                  <FormError message={errors.cnpj} />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="telefone">Telefone</FormLabel>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                  <FormError message={errors.telefone} />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                  <FormError message={errors.email} />
                </FormField>

                <FormField className="md:col-span-2">
                  <FormLabel htmlFor="endereco">Endereço</FormLabel>
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Digite o endereço completo"
                    rows={3}
                  />
                  <FormError message={errors.endereco} />
                </FormField>
              </div>

              <div className="flex items-center justify-end gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/empresas')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}