// Constantes do sistema
export const ROLES = {
  ADMIN: 'admin',
  CTR: 'ctr',
  PARCEIRO: 'parceiro',
  CHECKUP: 'checkup'
} as const

export const STATUS_ENCAMINHAMENTO = {
  ENCAMINHADO: 'encaminhado',
  EXECUTADO: 'executado',
  INTERVENCAO: 'intervencao',
  ACOMPANHAMENTO: 'acompanhamento'
} as const

export const TIPO_ENCAMINHAMENTO = {
  CONVENIO: 'convenio',
  PARTICULAR: 'particular'
} as const

export const STATUS_CHECKUP = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido'
} as const

export const TIPO_EMPRESA = {
  PARCEIRO: 'parceiro',
  CHECKUP: 'checkup'
} as const

// Labels para exibição
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.CTR]: 'Recepção CTR',
  [ROLES.PARCEIRO]: 'Parceiro',
  [ROLES.CHECKUP]: 'Empresa Check-up'
} as const

export const STATUS_LABELS = {
  [STATUS_ENCAMINHAMENTO.ENCAMINHADO]: 'Encaminhado',
  [STATUS_ENCAMINHAMENTO.EXECUTADO]: 'Executado',
  [STATUS_ENCAMINHAMENTO.INTERVENCAO]: 'Intervenção',
  [STATUS_ENCAMINHAMENTO.ACOMPANHAMENTO]: 'Acompanhamento'
} as const

export const STATUS_CHECKUP_LABELS = {
  [STATUS_CHECKUP.PENDENTE]: 'Pendente',
  [STATUS_CHECKUP.EM_ANDAMENTO]: 'Em Andamento',
  [STATUS_CHECKUP.CONCLUIDO]: 'Concluído'
} as const

// Cores para status
export const STATUS_COLORS = {
  [STATUS_ENCAMINHAMENTO.ENCAMINHADO]: 'bg-gray-100 text-gray-800',
  [STATUS_ENCAMINHAMENTO.EXECUTADO]: 'bg-green-100 text-green-800',
  [STATUS_ENCAMINHAMENTO.INTERVENCAO]: 'bg-yellow-100 text-yellow-800',
  [STATUS_ENCAMINHAMENTO.ACOMPANHAMENTO]: 'bg-blue-100 text-blue-800'
} as const

export const STATUS_CHECKUP_COLORS = {
  [STATUS_CHECKUP.PENDENTE]: 'bg-gray-100 text-gray-800',
  [STATUS_CHECKUP.EM_ANDAMENTO]: 'bg-blue-100 text-blue-800',
  [STATUS_CHECKUP.CONCLUIDO]: 'bg-green-100 text-green-800'
} as const

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const

// Configurações de validação
export const VALIDATION = {
  CPF_LENGTH: 11,
  CNPJ_LENGTH: 14,
  CRM_MIN_LENGTH: 4,
  CRM_MAX_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6
} as const

// Mensagens do sistema
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Registro criado com sucesso!',
    UPDATED: 'Registro atualizado com sucesso!',
    DELETED: 'Registro excluído com sucesso!',
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!'
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro inesperado. Tente novamente.',
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Registro não encontrado.',
    VALIDATION: 'Verifique os dados informados.',
    LOGIN_FAILED: 'Email ou senha incorretos.'
  },
  CONFIRM: {
    DELETE: 'Tem certeza que deseja excluir este registro?',
    LOGOUT: 'Tem certeza que deseja sair do sistema?'
  }
} as const

// Configurações de formato
export const FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm'
} as const