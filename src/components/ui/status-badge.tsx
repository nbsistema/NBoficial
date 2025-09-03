import React from 'react'
import { Badge } from './badge'
import { STATUS_COLORS, STATUS_LABELS, STATUS_CHECKUP_COLORS, STATUS_CHECKUP_LABELS } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
  type?: 'encaminhamento' | 'checkup'
  className?: string
}

export function StatusBadge({ status, type = 'encaminhamento', className }: StatusBadgeProps) {
  if (type === 'checkup') {
    const colorClass = STATUS_CHECKUP_COLORS[status as keyof typeof STATUS_CHECKUP_COLORS] || 'bg-gray-100 text-gray-800'
    const label = STATUS_CHECKUP_LABELS[status as keyof typeof STATUS_CHECKUP_LABELS] || status

    return (
      <Badge className={`${colorClass} ${className}`}>
        {label}
      </Badge>
    )
  }

  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
  const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status

  return (
    <Badge className={`${colorClass} ${className}`}>
      {label}
    </Badge>
  )
}