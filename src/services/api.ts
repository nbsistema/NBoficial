import { supabase } from '@/lib/supabase'
import type {
  Empresa, EmpresaForm,
  Medico, MedicoForm,
  Paciente, PacienteForm,
  Encaminhamento, EncaminhamentoForm,
  Exame,
  Convenio,
  Checkup,
  CheckupPaciente,
  UserProfile,
  FiltroEncaminhamentos,
  FiltroPacientes
} from '@/types'

// Serviços para Empresas
export const empresaService = {
  async getAll(): Promise<Empresa[]> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(empresa: EmpresaForm): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .insert(empresa)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, empresa: Partial<EmpresaForm>): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .update(empresa)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async toggleStatus(id: string): Promise<Empresa> {
    const empresa = await this.getById(id)
    if (!empresa) throw new Error('Empresa não encontrada')

    return this.update(id, { ativa: !empresa.ativa })
  }
}

// Serviços para Médicos
export const medicoService = {
  async getAll(empresaId?: string): Promise<Medico[]> {
    let query = supabase
      .from('medicos')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .order('nome')

    if (empresaId) {
      query = query.eq('empresa_id', empresaId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Medico | null> {
    const { data, error } = await supabase
      .from('medicos')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(medico: MedicoForm): Promise<Medico> {
    const { data, error } = await supabase
      .from('medicos')
      .insert(medico)
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, medico: Partial<MedicoForm>): Promise<Medico> {
    const { data, error } = await supabase
      .from('medicos')
      .update(medico)
      .eq('id', id)
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('medicos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Serviços para Pacientes
export const pacienteService = {
  async getAll(filtros?: FiltroPacientes): Promise<Paciente[]> {
    let query = supabase
      .from('pacientes')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .order('nome')

    if (filtros?.nome) {
      query = query.ilike('nome', `%${filtros.nome}%`)
    }

    if (filtros?.cpf) {
      query = query.eq('cpf', filtros.cpf.replace(/\D/g, ''))
    }

    if (filtros?.empresa_id) {
      query = query.eq('empresa_id', filtros.empresa_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Paciente | null> {
    const { data, error } = await supabase
      .from('pacientes')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(paciente: PacienteForm): Promise<Paciente> {
    // Limpar CPF antes de salvar
    const pacienteData = {
      ...paciente,
      cpf: paciente.cpf.replace(/\D/g, '')
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert(pacienteData)
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, paciente: Partial<PacienteForm>): Promise<Paciente> {
    // Limpar CPF se fornecido
    const pacienteData = paciente.cpf 
      ? { ...paciente, cpf: paciente.cpf.replace(/\D/g, '') }
      : paciente

    const { data, error } = await supabase
      .from('pacientes')
      .update(pacienteData)
      .eq('id', id)
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getByCPF(cpf: string): Promise<Paciente | null> {
    const { data, error } = await supabase
      .from('pacientes')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .eq('cpf', cpf.replace(/\D/g, ''))
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  }
}

// Serviços para Exames
export const exameService = {
  async getAll(): Promise<Exame[]> {
    const { data, error } = await supabase
      .from('exames')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Exame | null> {
    const { data, error } = await supabase
      .from('exames')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

// Serviços para Convênios
export const convenioService = {
  async getAll(empresaId?: string): Promise<Convenio[]> {
    let query = supabase
      .from('convenios')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .eq('ativo', true)
      .order('nome')

    if (empresaId) {
      query = query.eq('empresa_id', empresaId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }
}

// Serviços para Encaminhamentos
export const encaminhamentoService = {
  async getAll(filtros?: FiltroEncaminhamentos): Promise<Encaminhamento[]> {
    let query = supabase
      .from('encaminhamentos')
      .select(`
        *,
        pacientes(nome, cpf),
        medicos(nome, crm, empresas(nome)),
        exames(nome, codigo),
        convenios(nome)
      `)
      .order('created_at', { ascending: false })

    if (filtros?.status) {
      query = query.eq('status', filtros.status)
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo)
    }

    if (filtros?.data_inicio) {
      query = query.gte('created_at', filtros.data_inicio)
    }

    if (filtros?.data_fim) {
      query = query.lte('created_at', filtros.data_fim)
    }

    if (filtros?.medico_id) {
      query = query.eq('medico_id', filtros.medico_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Encaminhamento | null> {
    const { data, error } = await supabase
      .from('encaminhamentos')
      .select(`
        *,
        pacientes(nome, cpf, telefone, email),
        medicos(nome, crm, especialidade, empresas(nome)),
        exames(nome, codigo, descricao),
        convenios(nome, codigo)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(encaminhamento: EncaminhamentoForm): Promise<Encaminhamento> {
    const { data, error } = await supabase
      .from('encaminhamentos')
      .insert(encaminhamento)
      .select(`
        *,
        pacientes(nome, cpf),
        medicos(nome, crm, empresas(nome)),
        exames(nome, codigo),
        convenios(nome)
      `)
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, encaminhamento: Partial<EncaminhamentoForm>): Promise<Encaminhamento> {
    const { data, error } = await supabase
      .from('encaminhamentos')
      .update(encaminhamento)
      .eq('id', id)
      .select(`
        *,
        pacientes(nome, cpf),
        medicos(nome, crm, empresas(nome)),
        exames(nome, codigo),
        convenios(nome)
      `)
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string, detalhes?: string): Promise<Encaminhamento> {
    const updateData: any = { status }
    
    if (status === 'executado') {
      updateData.data_execucao = new Date().toISOString()
    }
    
    if (status === 'intervencao' && detalhes) {
      updateData.detalhes_intervencao = detalhes
    }

    return this.update(id, updateData)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('encaminhamentos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Serviços para Check-ups
export const checkupService = {
  async getAll(empresaId?: string): Promise<Checkup[]> {
    let query = supabase
      .from('checkups')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .order('nome')

    if (empresaId) {
      query = query.eq('empresa_id', empresaId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Checkup | null> {
    const { data, error } = await supabase
      .from('checkups')
      .select(`
        *,
        empresas(nome, tipo),
        checkup_itens(
          id,
          exames(nome, codigo, descricao)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

// Serviços para Solicitações de Check-up
export const checkupPacienteService = {
  async getAll(empresaId?: string): Promise<CheckupPaciente[]> {
    let query = supabase
      .from('checkup_pacientes')
      .select(`
        *,
        checkups(nome, empresas(nome)),
        pacientes(nome, cpf)
      `)
      .order('data_solicitacao', { ascending: false })

    if (empresaId) {
      query = query.eq('checkups.empresa_id', empresaId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<CheckupPaciente | null> {
    const { data, error } = await supabase
      .from('checkup_pacientes')
      .select(`
        *,
        checkups(
          nome,
          descricao,
          empresas(nome),
          checkup_itens(
            exames(nome, codigo, descricao)
          )
        ),
        pacientes(nome, cpf, telefone, email)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string, observacao?: string): Promise<CheckupPaciente> {
    const updateData: any = { status }
    
    if (observacao) {
      updateData.observacao = observacao
    }
    
    if (status === 'concluido') {
      updateData.data_conclusao = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('checkup_pacientes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        checkups(nome, empresas(nome)),
        pacientes(nome, cpf)
      `)
      .single()

    if (error) throw error
    return data
  }
}

// Serviços para Usuários
export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('user_id', userId)
      .select(`
        *,
        empresas(nome, tipo)
      `)
      .single()

    if (error) throw error
    return data
  }
}

// Serviços para Estatísticas
export const statsService = {
  async getDashboardStats() {
    const [
      { count: totalEncaminhamentos },
      { count: executados },
      { count: intervencoes },
      { count: acompanhamentos },
      { count: totalEmpresas },
      { count: totalPacientes }
    ] = await Promise.all([
      supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }),
      supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'executado'),
      supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'intervencao'),
      supabase.from('encaminhamentos').select('*', { count: 'exact', head: true }).eq('status', 'acompanhamento'),
      supabase.from('empresas').select('*', { count: 'exact', head: true }),
      supabase.from('pacientes').select('*', { count: 'exact', head: true })
    ])

    const hoje = new Date().toISOString().split('T')[0]
    const { count: encaminhamentosHoje } = await supabase
      .from('encaminhamentos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hoje)

    return {
      totalEncaminhamentos: totalEncaminhamentos || 0,
      executados: executados || 0,
      intervencoes: intervencoes || 0,
      acompanhamentos: acompanhamentos || 0,
      totalEmpresas: totalEmpresas || 0,
      totalPacientes: totalPacientes || 0,
      encaminhamentosHoje: encaminhamentosHoje || 0,
      taxaExecucao: totalEncaminhamentos ? Math.round((executados / totalEncaminhamentos) * 100) : 0
    }
  }
}