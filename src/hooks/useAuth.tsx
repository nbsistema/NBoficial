import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useUserProfile, type UserProfile } from '@/hooks/useUserProfile'

// --- Tipos auxiliares ---
export type Role = 'admin' | 'ctr' | 'parceiro' | 'checkup'

// --- Tipo do contexto ---
type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
  hasPermission: (requiredRoles: Role[]) => boolean
  isAdmin: boolean
  isCTR: boolean
  hasFullAccess: boolean
}

// --- Contexto ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refresh: async () => {},
  hasPermission: () => false,
  isAdmin: false,
  isCTR: false,
  hasFullAccess: false,
})

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [profileChecked, setProfileChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    profile,
    loading: loadingProfile,
    fetchUserProfile,
    clearProfile,
    error: profileError,
  } = useUserProfile()
  
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Carregamento inicial da sessão
  useEffect(() => {
    let mounted = true

    async function loadInitialSession() {
      try {
        console.log('🔐 AuthProvider: Carregando sessão inicial...', new Date().toISOString())
        console.log('🔐 AuthProvider: Supabase config:', {
          url: supabase.supabaseUrl?.substring(0, 30) + '...',
          hasKey: !!supabase.supabaseKey
        })
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('❌ AuthProvider: Erro ao buscar sessão:', error.message)
          setError(`Falha ao obter sessão: ${error.message}`)
          setLoadingUser(false)
          return
        }

        const sessionUser = session?.user ?? null
        setUser(sessionUser)
        
        console.log('🔐 AuthProvider: Sessão obtida:', {
          hasSession: !!session,
          hasUser: !!sessionUser,
          userId: sessionUser?.id
        })
        
        if (sessionUser) {
          console.log('✅ AuthProvider: Usuário encontrado na sessão:', sessionUser.id)
          await loadUserProfile(sessionUser)
        } else {
          console.log('ℹ️ AuthProvider: Nenhum usuário na sessão')
          setProfileChecked(true)
        }
        
      } catch (e: any) {
        console.error('❌ AuthProvider: Exceção ao carregar sessão:', e)
        if (mounted) {
          setError('Falha ao inicializar autenticação')
        }
      } finally {
        if (mounted) {
          setLoadingUser(false)
        }
      }
    }

    // Timeout de segurança mais longo
    timeoutRef.current = setTimeout(() => {
      if (mounted && (loadingUser || loadingProfile)) {
        console.warn('⚠️ AuthProvider: Timeout no carregamento, forçando fim do loading')
        setLoadingUser(false)
        setProfileChecked(true)
      }
    }, 15000) // 15 segundos

    loadInitialSession()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider: Mudança de estado de auth:', event, new Date().toISOString())
        
        const nextUser = session?.user ?? null
        setUser(nextUser)
        
        if (nextUser) {
          await loadUserProfile(nextUser)
        } else {
          console.log('ℹ️ AuthProvider: Usuário deslogado, limpando perfil')
          clearProfile()
          setProfileChecked(true)
          setError(null)
        }
        
        setLoadingUser(false)
      }
    )

    return () => {
      mounted = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, clearProfile])

  // Função para carregar perfil do usuário
  const loadUserProfile = async (user: User) => {
    try {
      console.log('👤 AuthProvider: Carregando perfil para usuário:', user.id)
      console.log('👤 AuthProvider: Email do usuário:', user.email)
      setProfileChecked(false)
      
      // Usar o hook useUserProfile para buscar o perfil
      await fetchUserProfile(user.id)
      
      // Aguardar um pouco para o hook processar
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('👤 AuthProvider: Processo de carregamento de perfil concluído')
      
    } catch (e: any) {
      console.error('❌ AuthProvider: Exceção ao carregar perfil:', e)
      setError(`Erro ao carregar perfil: ${e?.message || 'Erro desconhecido'}`)
    } finally {
      setProfileChecked(true)
    }
  }

  // Limpar erro quando perfil for carregado com sucesso
  useEffect(() => {
    if (profile && error) {
      console.log('✅ AuthProvider: Perfil carregado, limpando erro')
      setError(null)
    }
  }, [profile, error])

  // Propagar erros do perfil
  useEffect(() => {
    if (profileError) {
      console.log('❌ AuthProvider: Erro do perfil propagado:', profileError)
      setError(profileError)
    }
  }, [profileError])

  // Ações de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      setError(null) 
      console.log('🔐 AuthProvider: Tentando login para:', email)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ AuthProvider: Erro no login:', error.message)
        setError(error.message)
      }
      
      return { error }
    } catch (e: any) {
      const errorMessage = 'Falha ao fazer login'
      console.error('❌ AuthProvider: Exceção no login:', e)
      setError(`${errorMessage}: ${e?.message || 'Erro desconhecido'}`)
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔐 AuthProvider: Fazendo logout...')
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ AuthProvider: Erro no logout:', error.message)
        setError(error.message)
      } else {
        console.log('✅ AuthProvider: Logout realizado com sucesso')
        setUser(null)
        clearProfile()
        setError(null)
        setProfileChecked(true)
      }
    } catch (e: any) {
      const errorMessage = 'Falha ao fazer logout'
      console.error('❌ AuthProvider: Exceção no logout:', e)
      setError(errorMessage)
    }
  }

  const refresh = async () => {
    try {
      console.log('🔐 AuthProvider: Atualizando sessão...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      const nextUser = session?.user ?? null
      setUser(nextUser)
      
      if (nextUser) {
        await fetchUserProfile(nextUser.id)
      } else {
        clearProfile()
        setProfileChecked(true)
      }
    } catch (e: any) {
      console.error('❌ AuthProvider: Erro ao atualizar sessão:', e)
      setError(e?.message || 'Erro ao atualizar sessão')
    }
  }

  const hasPermission = useCallback((requiredRoles: Role[]) => {
    if (!profile) return false
    return requiredRoles.includes(profile.role)
  }, [profile])

  // Loading só deve ser true se ainda não verificamos o perfil
  const loading = useMemo(() => loadingUser || (loadingProfile && !profileChecked), [loadingUser, loadingProfile, profileChecked])
  const isAdmin = useMemo(() => profile?.role === 'admin', [profile])
  const isCTR = useMemo(() => profile?.role === 'ctr', [profile])
  const hasFullAccess = useMemo(() => profile?.role === 'admin', [profile])

  const value = useMemo<AuthContextType>(() => ({
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
    refresh,
    hasPermission,
    isAdmin,
    isCTR,
    hasFullAccess,
  }), [user, profile, loading, error, isAdmin, isCTR, hasFullAccess])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- Hook ---
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}