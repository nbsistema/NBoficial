import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
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
  const [error, setError] = useState<string | null>(null)

  const {
    profile,
    loading: loadingProfile,
    fetchUserProfile,
    clearProfile,
    error: profileError,
  } = useUserProfile()

  // Carregamento inicial da sessão
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    async function loadInitialSession() {
      try {
        console.log('🔐 AuthProvider: Carregando sessão inicial...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('❌ AuthProvider: Erro ao buscar sessão:', error.message)
          setError('Falha ao obter sessão')
          setLoadingUser(false)
          return
        }

        const sessionUser = session?.user ?? null
        setUser(sessionUser)
        
        if (sessionUser) {
          console.log('✅ AuthProvider: Usuário encontrado na sessão:', sessionUser.id)
          await fetchUserProfile(sessionUser.id)
        } else {
          console.log('ℹ️ AuthProvider: Nenhum usuário na sessão')
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

    // Timeout de segurança para evitar loading infinito
    timeoutId = setTimeout(() => {
      if (mounted && loadingUser) {
        console.warn('⚠️ AuthProvider: Timeout no carregamento inicial, forçando fim do loading')
        setLoadingUser(false)
        setError('Timeout ao carregar sessão')
      }
    }, 8000)

    loadInitialSession()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider: Mudança de estado de auth:', event)
        
        const nextUser = session?.user ?? null
        setUser(nextUser)
        
        if (nextUser) {
          console.log('✅ AuthProvider: Usuário logado, buscando perfil...')
          // Buscar perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', nextUser.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ AuthProvider: Erro ao buscar perfil:', profileError)
            setError('Falha ao buscar perfil do usuário')
          } else if (profileData) {
            console.log('✅ AuthProvider: Perfil encontrado:', profileData)
            await fetchUserProfile(nextUser.id)
          } else {
            console.warn('⚠️ AuthProvider: Perfil não encontrado para usuário:', nextUser.id)
            setError('Perfil de usuário não encontrado')
          }
        } else {
          console.log('ℹ️ AuthProvider: Usuário deslogado, limpando perfil')
          clearProfile()
        }
        
        setLoadingUser(false)
      }
    )

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, clearProfile])

  // Propagar erros do perfil
  useEffect(() => {
    if (profileError) {
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
      setError(errorMessage)
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

  const loading = useMemo(() => loadingUser || loadingProfile, [loadingUser, loadingProfile])
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