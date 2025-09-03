// Formatadores de dados
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '')
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '')
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function formatCRM(crm: string): string {
  return crm.toUpperCase()
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100)
}

// Formatadores para inputs (máscaras)
export function maskCPF(value: string): string {
  const clean = value.replace(/\D/g, '')
  const match = clean.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/)
  
  if (!match) return value
  
  return [match[1], match[2], match[3], match[4]]
    .filter(Boolean)
    .join('.')
    .replace(/\.(\d{3})$/, '.$1-')
    .replace(/\.$/, '')
}

export function maskCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '')
  const match = clean.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/)
  
  if (!match) return value
  
  return [match[1], match[2], match[3], match[4], match[5]]
    .filter(Boolean)
    .join('.')
    .replace(/\.(\d{3})\.(\d{3})\.(\d{4})\.(\d{2})$/, '.$2.$3/$4-$5')
    .replace(/^(\d{2})\./, '$1.')
}

export function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, '')
  const match = clean.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/)
  
  if (!match) return value
  
  if (clean.length <= 10) {
    const match10 = clean.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/)
    if (!match10) return value
    return [match10[1], match10[2], match10[3]]
      .filter(Boolean)
      .join(' ')
      .replace(/^(\d{2}) /, '($1) ')
      .replace(/ (\d{4})$/, '-$1')
  }
  
  return [match[1], match[2], match[3]]
    .filter(Boolean)
    .join(' ')
    .replace(/^(\d{2}) /, '($1) ')
    .replace(/ (\d{4})$/, '-$1')
}

export function maskCEP(value: string): string {
  const clean = value.replace(/\D/g, '')
  return clean.replace(/^(\d{5})(\d{0,3})$/, '$1-$2').replace(/-$/, '')
}

// Função para remover formatação
export function unformat(value: string): string {
  return value.replace(/\D/g, '')
}

// Função para capitalizar texto
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Função para capitalizar cada palavra
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

// Função para truncar texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Função para gerar iniciais
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}