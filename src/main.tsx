import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './app/globals.css'

console.log('🚀 Main: Inicializando aplicação React')
console.log('🚀 Main: Ambiente:', import.meta.env.MODE)
console.log('[BOOT] main.tsx entrou')
document.body.setAttribute('data-boot', 'ok')
console.log('🚀 Main: Variáveis de ambiente disponíveis:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'definida' : 'AUSENTE',
  isProd: import.meta.env.PROD
})

// Tratamento de erro global para evitar crash
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Elemento root não encontrado')
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    
    console.log('✅ Main: Aplicação renderizada com sucesso')
  } catch (error) {
    console.error('🚨 Main: Erro ao renderizar aplicação:', error)
    
    // Fallback: mostrar erro na tela
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f9fafb; font-family: system-ui;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Erro ao carregar aplicação</h1>
            <p style="color: #6b7280; margin-bottom: 1rem;">Ocorreu um erro ao inicializar o sistema.</p>
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
              Recarregar Página
            </button>
          </div>
        </div>
      `
    }
  }
}

renderApp()
