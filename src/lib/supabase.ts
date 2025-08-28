import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const createSupabaseClient = () => {
  console.log('🔧 Supabase: Criando cliente Supabase')
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('🔧 Supabase: Variáveis de ambiente:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
  })
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('🚨 Supabase: Variáveis de ambiente ausentes!')
    console.error('🚨 Supabase: VITE_SUPABASE_URL:', supabaseUrl ? 'definida' : 'AUSENTE')
    console.error('🚨 Supabase: VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'definida' : 'AUSENTE')
    // Lançar erro para evitar comportamento inesperado
    throw new Error('Configuração do Supabase ausente. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  }
  
  console.log('✅ Supabase: Criando cliente com configurações válidas')
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit'
    }
  })

  console.log('✅ Supabase: Cliente criado com sucesso')
  return client
}

console.log('🔧 Supabase: Inicializando cliente global')
export const supabase = createSupabaseClient()

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'ctr' | 'parceiro' | 'checkup'
          empresa_id: string | null
          nome: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'ctr' | 'parceiro' | 'checkup'
          empresa_id?: string | null
          nome: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'ctr' | 'parceiro' | 'checkup'
          empresa_id?: string | null
          nome?: string
          created_at?: string
          updated_at?: string
        }
      }
      empresas: {
        Row: {
          id: string
          nome: string
          tipo: 'parceiro' | 'checkup'
          cnpj: string | null
          telefone: string | null
          email: string | null
          endereco: string | null
          ativa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          tipo: 'parceiro' | 'checkup'
          cnpj?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          tipo?: 'parceiro' | 'checkup'
          cnpj?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medicos: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          crm: string
          especialidade: string | null
          telefone: string | null
          email: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          crm: string
          especialidade?: string | null
          telefone?: string | null
          email?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          crm?: string
          especialidade?: string | null
          telefone?: string | null
          email?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      convenios: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          codigo: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          codigo?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          codigo?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          nome: string
          cpf: string
          nascimento: string | null
          telefone: string | null
          email: string | null
          endereco: string | null
          empresa_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          cpf: string
          nascimento?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          empresa_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cpf?: string
          nascimento?: string | null
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          empresa_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exames: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          codigo: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          codigo?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          codigo?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      encaminhamentos: {
        Row: {
          id: string
          paciente_id: string
          medico_id: string | null
          exame_id: string | null
          ctr_id: string | null
          status: 'encaminhado' | 'executado' | 'intervencao' | 'acompanhamento'
          tipo: 'convenio' | 'particular'
          convenio_id: string | null
          observacao: string | null
          detalhes_intervencao: string | null
          data_execucao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          paciente_id: string
          medico_id?: string | null
          exame_id?: string | null
          ctr_id?: string | null
          status?: 'encaminhado' | 'executado' | 'intervencao' | 'acompanhamento'
          tipo: 'convenio' | 'particular'
          convenio_id?: string | null
          observacao?: string | null
          detalhes_intervencao?: string | null
          data_execucao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          paciente_id?: string
          medico_id?: string | null
          exame_id?: string | null
          ctr_id?: string | null
          status?: 'encaminhado' | 'executado' | 'intervencao' | 'acompanhamento'
          tipo?: 'convenio' | 'particular'
          convenio_id?: string | null
          observacao?: string | null
          detalhes_intervencao?: string | null
          data_execucao?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      checkups: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          descricao: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          descricao?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          nome?: string
          descricao?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      checkup_itens: {
        Row: {
          id: string
          checkup_id: string
          exame_id: string
          created_at: string
        }
        Insert: {
          id?: string
          checkup_id: string
          exame_id: string
          created_at?: string
        }
        Update: {
          id?: string
          checkup_id?: string
          exame_id?: string
          created_at?: string
        }
      }
      checkup_pacientes: {
        Row: {
          id: string
          checkup_id: string
          paciente_id: string
          status: 'pendente' | 'em_andamento' | 'concluido'
          observacao: string | null
          data_solicitacao: string
          data_conclusao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checkup_id: string
          paciente_id: string
          status?: 'pendente' | 'em_andamento' | 'concluido'
          observacao?: string | null
          data_solicitacao?: string
          data_conclusao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          checkup_id?: string
          paciente_id?: string
          status?: 'pendente' | 'em_andamento' | 'concluido'
          observacao?: string | null
          data_solicitacao?: string
          data_conclusao?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}