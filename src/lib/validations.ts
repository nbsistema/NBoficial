import { VALIDATION } from './constants'

// Validações de CPF
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== VALIDATION.CPF_LENGTH) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

// Validações de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  
  if (cleanCNPJ.length !== VALIDATION.CNPJ_LENGTH) return false
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return digit1 === parseInt(cleanCNPJ.charAt(12)) && digit2 === parseInt(cleanCNPJ.charAt(13))
}

// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de telefone
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

// Validação de CRM
export function isValidCRM(crm: string): boolean {
  const cleanCRM = crm.replace(/\D/g, '')
  return cleanCRM.length >= VALIDATION.CRM_MIN_LENGTH && cleanCRM.length <= VALIDATION.CRM_MAX_LENGTH
}

// Validação de senha
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH
}

// Validação de data
export function isValidDate(date: string): boolean {
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime()) && parsedDate <= new Date()
}

// Validação de campos obrigatórios
export function isRequired(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0)
}

// Validações específicas para formulários
export const validateEmpresaForm = (data: any) => {
  const errors: Record<string, string> = {}

  if (!isRequired(data.nome)) {
    errors.nome = 'Nome é obrigatório'
  }

  if (!data.tipo) {
    errors.tipo = 'Tipo é obrigatório'
  }

  if (data.cnpj && !isValidCNPJ(data.cnpj)) {
    errors.cnpj = 'CNPJ inválido'
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  if (data.telefone && !isValidPhone(data.telefone)) {
    errors.telefone = 'Telefone inválido'
  }

  return errors
}

export const validateMedicoForm = (data: any) => {
  const errors: Record<string, string> = {}

  if (!isRequired(data.nome)) {
    errors.nome = 'Nome é obrigatório'
  }

  if (!isRequired(data.crm)) {
    errors.crm = 'CRM é obrigatório'
  } else if (!isValidCRM(data.crm)) {
    errors.crm = 'CRM inválido'
  }

  if (!data.empresa_id) {
    errors.empresa_id = 'Empresa é obrigatória'
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  if (data.telefone && !isValidPhone(data.telefone)) {
    errors.telefone = 'Telefone inválido'
  }

  return errors
}

export const validatePacienteForm = (data: any) => {
  const errors: Record<string, string> = {}

  if (!isRequired(data.nome)) {
    errors.nome = 'Nome é obrigatório'
  }

  if (!isRequired(data.cpf)) {
    errors.cpf = 'CPF é obrigatório'
  } else if (!isValidCPF(data.cpf)) {
    errors.cpf = 'CPF inválido'
  }

  if (data.nascimento && !isValidDate(data.nascimento)) {
    errors.nascimento = 'Data de nascimento inválida'
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  if (data.telefone && !isValidPhone(data.telefone)) {
    errors.telefone = 'Telefone inválido'
  }

  return errors
}

export const validateEncaminhamentoForm = (data: any) => {
  const errors: Record<string, string> = {}

  if (!data.paciente_id) {
    errors.paciente_id = 'Paciente é obrigatório'
  }

  if (!data.exame_id) {
    errors.exame_id = 'Exame é obrigatório'
  }

  if (!data.tipo) {
    errors.tipo = 'Tipo é obrigatório'
  }

  if (data.tipo === 'convenio' && !data.convenio_id) {
    errors.convenio_id = 'Convênio é obrigatório para tipo convênio'
  }

  return errors
}

export const validateLoginForm = (data: any) => {
  const errors: Record<string, string> = {}

  if (!isRequired(data.email)) {
    errors.email = 'Email é obrigatório'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email inválido'
  }

  if (!isRequired(data.password)) {
    errors.password = 'Senha é obrigatória'
  } else if (!isValidPassword(data.password)) {
    errors.password = `Senha deve ter pelo menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`
  }

  return errors
}