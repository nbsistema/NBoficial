import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './app/globals.css'

console.log('🚀 Main: Inicializando aplicação React')
console.log('🚀 Main: Ambiente:', import.meta.env.MODE)
console.log('🚀 Main: Variáveis de ambiente disponíveis:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)