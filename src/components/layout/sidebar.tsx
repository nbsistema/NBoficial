import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
  Activity,
  Building2,
  Calendar,
  ChevronLeft,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  Users,
  UserCheck,
  ClipboardList,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems: Record<string, Array<{ icon: any; label: string; href: string }>> = {
  admin: [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Empresas', href: '/admin/empresas' },
    { icon: Users, label: 'Pacientes', href: '/admin/pacientes' },
    { icon: FileText, label: 'Encaminhamentos', href: '/admin/encaminhamentos' },
    { icon: BarChart3, label: 'Relatórios', href: '/admin/relatorios' },
    { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
    // Acesso às funcionalidades CTR
    { icon: FileText, label: 'CTR - Pedidos', href: '/ctr/pedidos' },
    { icon: Building2, label: 'CTR - Empresas', href: '/ctr/empresas' },
    { icon: Users, label: 'CTR - Pacientes', href: '/ctr/pacientes' },
    { icon: BarChart3, label: 'CTR - Relatórios', href: '/ctr/relatorios' },
    // Acesso às funcionalidades Parceiro
    { icon: Stethoscope, label: 'Parceiro - Médicos', href: '/parceiro/medicos' },
    { icon: Activity, label: 'Parceiro - Convênios', href: '/parceiro/convenios' },
    { icon: FileText, label: 'Parceiro - Encaminhamentos', href: '/parceiro/encaminhamentos' },
    { icon: UserCheck, label: 'Parceiro - Pacientes', href: '/parceiro/pacientes' },
    // Acesso às funcionalidades Check-up
    { icon: ClipboardList, label: 'Check-up - Baterias', href: '/checkup/baterias' },
    { icon: Users, label: 'Check-up - Funcionários', href: '/checkup/funcionarios' },
    { icon: Calendar, label: 'Check-up - Solicitações', href: '/checkup/solicitacoes' }
  ],
  ctr: [
    { icon: Home, label: 'Dashboard', href: '/ctr' },
    { icon: Building2, label: 'Empresas', href: '/ctr/empresas' },
    { icon: FileText, label: 'Pedidos', href: '/ctr/pedidos' },
    { icon: Users, label: 'Pacientes', href: '/ctr/pacientes' },
    { icon: BarChart3, label: 'Relatórios', href: '/ctr/relatorios' }
  ],
  parceiro: [
    { icon: Home, label: 'Dashboard', href: '/parceiro' },
    { icon: Stethoscope, label: 'Médicos', href: '/parceiro/medicos' },
    { icon: Activity, label: 'Convênios', href: '/parceiro/convenios' },
    { icon: FileText, label: 'Encaminhamentos', href: '/parceiro/encaminhamentos' },
    { icon: UserCheck, label: 'Pacientes', href: '/parceiro/pacientes' }
  ],
  checkup: [
    { icon: Home, label: 'Dashboard', href: '/checkup' },
    { icon: ClipboardList, label: 'Check-ups', href: '/checkup/baterias' },
    { icon: Users, label: 'Funcionários', href: '/checkup/funcionarios' },
    { icon: Calendar, label: 'Solicitações', href: '/checkup/solicitacoes' }
  ]
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { profile, signOut } = useAuth()

  if (!profile) return null

  const items = menuItems[profile.role] || []

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sistema CTR</h2>
              <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )
}