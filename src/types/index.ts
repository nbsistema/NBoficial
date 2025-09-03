// Tipos centralizados do sistema
export interface User {
  id: string
  email: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  role: 'admin' | 'ctr' | 'parceiro' | 'checkup'
  empresa_id?: string
  nome: string
  telefone?: string
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  nome: string
  tipo: 'parceiro' | 'checkup'
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export interface Medico {
  id: string
  empresa_id: string
  nome: string
  crm: string
  especialidade?: string
  telefone?: string
  email?: string
  ativo: boolean
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export interface Convenio {
  id: string
  empresa_id: string
  nome: string
  codigo?: string
  ativo: boolean
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export interface Paciente {
  id: string
  nome: string
  cpf: string
  nascimento?: string
  telefone?: string
  email?: string
  endereco?: string
  empresa_id?: string
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export interface Exame {
  id: string
  nome: string
  descricao?: string
  codigo?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Encaminhamento {
  id: string
  paciente_id: string
  medico_id?: string
  exame_id?: string
  ctr_id?: string
  status: 'encaminhado' | 'executado' | 'intervencao' | 'acompanhamento'
  tipo: 'convenio' | 'particular'
  convenio_id?: string
  observacao?: string
  detalhes_intervencao?: string
  data_execucao?: string
  created_at: string
  updated_at: string
  paciente?: Paciente
  medico?: Medico
  exame?: Exame
  convenio?: Convenio
}

export interface Checkup {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export interface CheckupItem {
  id: string
  checkup_id: string
  exame_id: string
  created_at: string
  exame?: Exame
}

export interface CheckupPaciente {
  id: string
  checkup_id: string
  paciente_id: string
  status: 'pendente' | 'em_andamento' | 'concluido'
  observacao?: string
  data_solicitacao: string
  data_conclusao?: string
  created_at: string
  updated_at: string
  checkup?: Checkup
  paciente?: Paciente
}

// Tipos para formulários
export interface LoginForm {
  email: string
  password: string
}

export interface EmpresaForm {
  nome: string
  tipo: 'parceiro' | 'checkup'
  cnpj?: string
  telefone?: string
  email?: string
  endereco?: string
  ativa: boolean
}

export interface MedicoForm {
  empresa_id: string
  nome: string
  crm: string
  especialidade?: string
  telefone?: string
  email?: string
  ativo: boolean
}

export interface PacienteForm {
  nome: string
  cpf: string
  nascimento?: string
  telefone?: string
  email?: string
  endereco?: string
  empresa_id?: string
}

export interface EncaminhamentoForm {
  paciente_id: string
  medico_id?: string
  exame_id?: string
  tipo: 'convenio' | 'particular'
  convenio_id?: string
  observacao?: string
}

// Tipos para filtros e busca
export interface FiltroEncaminhamentos {
  status?: string
  tipo?: string
  data_inicio?: string
  data_fim?: string
  medico_id?: string
  empresa_id?: string
}

export interface FiltroPacientes {
  nome?: string
  cpf?: string
  empresa_id?: string
}

// Tipos para estatísticas
export interface DashboardStats {
  totalEncaminhamentos: number
  executados: number
  intervencoes: number
  acompanhamentos: number
  totalEmpresas: number
  totalPacientes: number
  encaminhamentosHoje: number
  taxaExecucao: number
}

export interface CTRStats {
  pedidosPendentes: number
  executadosHoje: number
  totalIntervencoes: number
  pedidosHoje: number
}

export interface ParceiroStats {
  totalEncaminhamentos: number
  executados: number
  intervencoes: number
  acompanhamentos: number
  totalMedicos: number
  totalConvenios: number
}

export interface CheckupStats {
  totalBaterias: number
  totalFuncionarios: number
  solicitacoesPendentes: number
  solicitacoesConcluidas: number
}