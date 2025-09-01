import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import HomePage from './app/page'
import LoginPage from './app/login/page'
import AdminDashboard from './app/admin/page'
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