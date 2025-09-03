import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backTo?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  showBackButton = false,
  backTo,
  children,
  className
}: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}