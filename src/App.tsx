import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/toast'

// Pages
import HomePage from './app/page'
import LoginPage from './app/login/page'
import UnauthorizedPage from './app/unauthorized/page'

// Admin Pages
import AdminDashboard from './app/admin/page'
import EmpresasPage from './pages/admin/empresas'
import EmpresaFormPage from './pages/admin/empresas/form'

// CTR Pages
import CTRDashboard from './app/ctr/page'

// Parceiro Pages
import ParceiroDashboard from './app/parceiro/page'

// Checkup Pages
import CheckupDashboard from './app/checkup/page'

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/empresas" element={<EmpresasPage />} />
        <Route path="/admin/empresas/nova" element={<EmpresaFormPage />} />
        <Route path="/admin/empresas/:id" element={<EmpresaFormPage />} />
        
        {/* CTR Routes */}
        <Route path="/ctr" element={<CTRDashboard />} />
        
        {/* Parceiro Routes */}
        <Route path="/parceiro" element={<ParceiroDashboard />} />
        
        {/* Checkup Routes */}
        <Route path="/checkup" element={<CheckupDashboard />} />
      </Routes>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App