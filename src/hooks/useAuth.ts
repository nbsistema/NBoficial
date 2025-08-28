import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Definir o tipo UserProfile diretamente aqui para evitar problemas de importação
interface UserProfile {
  id: string
  user_id: string | null
  role: 'admin' | 'ctr' | 'parceiro' | 'checkup'
  empresa_id: string | null
  nome: string
  created_at: string | null
  updated_at: string | null
}


export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug: Log inicial
  console.log('🔧 useAuth: Hook inicializado')

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    console.log('🔧 useAuth: useEffect executado')

    const initializeAuth = async () => {
      try {
        console.log('🔧 useAuth: Inicializando autenticação...')
        
        // Timeout de segurança para evitar loop infinito
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ useAuth: Timeout na inicialização, finalizando loading')
            setLoading(false)
            setError('Timeout na inicialização da autenticação')
          }
        }, 10000) // 10 segundos
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('🔧 useAuth: Resposta getSession:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          error: sessionError 
        })
        
        if (!mounted) return
        
        // Limpar timeout se chegou até aqui
        if (timeoutId) clearTimeout(timeoutId)

        if (sessionError) {
          console.error('🚨 useAuth: Erro na sessão:', sessionError)
          setError('Erro ao obter sessão: ' + sessionError.message)
          setLoading(false)
          return
        }

        console.log('🔧 useAuth: Status da sessão:', session?.user?.id ? 'Usuário encontrado' : 'Sem usuário')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('🔧 useAuth: Buscando perfil do usuário:', session.user.id)
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🔧 useAuth: Sem usuário, finalizando loading')
          setLoading(false)
        }
      } catch (err) {
        if (!mounted) return
        if (timeoutId) clearTimeout(timeoutId)
        console.error('🚨 useAuth: Erro na inicialização:', err)
        setError('Erro ao inicializar autenticação: ' + (err as Error).message)
        setLoading(false)
      }
    }

    console.log('🔧 useAuth: Chamando initializeAuth')
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔧 useAuth: Mudança de estado:', event, {
          hasUser: !!session?.user,
          userId: session?.user?.id
        })
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Reset error when user logs in
          setError(null)
          console.log('🔧 useAuth: Usuário logado, buscando perfil')
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🔧 useAuth: Usuário deslogado')
          setProfile(null)
          setError(null)
          setLoading(false)
        }
      }
    )

    console.log('🔧 useAuth: Listener configurado')

    return () => {
      console.log('🔧 useAuth: Cleanup executado')
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    let timeoutId: NodeJS.Timeout
    
    try {
      console.log('🔧 useAuth: Buscando perfil para usuário:', userId)
      
      // Timeout de segurança
      timeoutId = setTimeout(() => {
        console.warn('⚠️ useAuth: Timeout na busca do perfil')
        setError('Timeout ao buscar perfil do usuário')
        setLoading(false)
      }, 8000) // 8 segundos
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Limpar timeout
      if (timeoutId) clearTimeout(timeoutId)

      console.log('🔧 useAuth: Resposta da consulta de perfil:', { 
        data, 
        error,
        hasData: !!data 
      })
        
      if (error) {
        console.error('🚨 useAuth: Erro ao buscar perfil:', error)
        
        if (error.code === 'PGRST116') {
          // Profile not found - this is a critical error
          console.error('🚨 useAuth: Perfil não encontrado para usuário:', userId)
          setError('Perfil de usuário não encontrado')
          setProfile(null)
        } else {
          console.error('🚨 useAuth: Erro geral ao buscar perfil:', error)
          setError('Erro ao buscar perfil do usuário')
          setProfile(null)
        }
      } else {
        console.log('✅ useAuth: Perfil encontrado:', { 
          role: data?.role, 
          nome: data?.nome,
          empresa_id: data?.empresa_id 
        })
        setProfile(data)
        setError(null)
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId)
      console.error('🚨 useAuth: Exceção ao buscar perfil:', err)
      setError('Erro ao buscar perfil do usuário: ' + (err as Error).message)
      setProfile(null)
    } finally {
      console.log('🔧 useAuth: Finalizando loading do perfil')
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      
      console.log('🔧 useAuth: Tentando login para:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔧 useAuth: Resposta do login:', { 
        hasUser: !!data?.user,
        userId: data?.user?.id,
        error 
      })
      
      if (error) {
        console.error('🚨 useAuth: Erro no login:', error)
        setError(error.message)
        return { error }
      }
      
      console.log('✅ useAuth: Login bem-sucedido:', data.user?.id)
      
      return { error: null }
    } catch (err) {
      console.error('🚨 useAuth: Exceção no login:', err)
      const errorMessage = 'Erro ao fazer login'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔧 useAuth: Fazendo logout')
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🚨 useAuth: Erro no logout:', error)
        setError(error.message)
        return { error }
      }
      
      // Clear local state
      console.log('🔧 useAuth: Limpando estado local')
      setUser(null)
      setProfile(null)
      
      return { error: null }
    } catch (err) {
      console.error('🚨 useAuth: Exceção no logout:', err)
      const errorMessage = 'Erro ao fazer logout'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  // Debug: Log do estado atual
  console.log('🔧 useAuth: Estado atual:', {
    hasUser: !!user,
    userId: user?.id,
    hasProfile: !!profile,
    profileRole: profile?.role,
    loading,
    error
  })

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isCTR: profile?.role === 'ctr',
    isParceiro: profile?.role === 'parceiro',
    isCheckup: profile?.role === 'checkup'
  }
}