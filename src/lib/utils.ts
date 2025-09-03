import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { STATUS_COLORS, STATUS_LABELS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funções de status (mantidas para compatibilidade)
export function getStatusColor(status: string) {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string) {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status
}