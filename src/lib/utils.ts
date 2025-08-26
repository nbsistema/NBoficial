import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(cnpj: string) {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'encaminhado':
      return 'bg-gray-100 text-gray-800'
    case 'executado':
      return 'bg-blue-100 text-blue-800'
    case 'intervencao':
      return 'bg-yellow-100 text-yellow-800'
    case 'acompanhamento':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'encaminhado':
      return 'Encaminhado'
    case 'executado':
      return 'Executado'
    case 'intervencao':
      return 'Intervenção'
    case 'acompanhamento':
      return 'Acompanhamento'
    default:
      return status
  }
}