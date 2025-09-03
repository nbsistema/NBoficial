import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import HomePage from './app/page'
import LoginPage from './app/login/page'
import AdminDashboard from './app/admin/page'
import AdminEmpresasPage from './app/admin/empresas/page'
import AdminUsuariosPage from './app/admin/usuarios/page'
import AdminConfiguracoesPage from './app/admin/configuracoes/page'
import CTRDashboard from './app/ctr/page'
import ParceiroDashboard from './app/parceiro/page'
import CheckupDashboard from './app/checkup/page'
import UnauthorizedPage from './app/unauthorized/page'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/empresas" element={<AdminEmpresasPage />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          <Route path="/admin/configuracoes" element={<AdminConfiguracoesPage />} />
          <Route path="/ctr" element={<CTRDashboard />} />
          <Route path="/parceiro" element={<ParceiroDashboard />} />
          <Route path="/checkup" element={<CheckupDashboard />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App