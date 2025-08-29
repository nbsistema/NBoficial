import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/hooks/useUserProfile'

// --- Tipos auxiliares ---
export type Role = 'admin' | 'ctr' | 'parceiro' | 'checkup' | (string & {})
export type Profile = {
  id: string
  role: Role
  // Campos adicionais do seu perfil
  [k: string]: unknown
}

// --- Tipo do contexto ---
type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
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
})

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook de perfil deve expor: { profile, loading, fetchUserProfile, error }
  const {
    profile,
    loading: loadingProfile,
    fetchUserProfile,
    error: profileError,
  } = useUserProfile()

  // Carregamento inicial + sessão corrente
  useEffect(() => {
    let mounted = true

    async function loadInitial() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!mounted) return

        if (error) {
          console.error('❌ Erro ao buscar sessão inicial:', error.message)
          setError(error.message)
          setUser(null)
          setLoadingUser(false)
          return
        }

        const sessionUser = data.session?.user ?? null
        setUser(sessionUser)

        if (sessionUser) {
          await fetchUserProfile(sessionUser.id)
        }
      } catch (e: any) {
        console.error('❌ Exceção em loadInitial:', e)
        setError(e?.message || 'Erro ao inicializar sessão')
      } finally {
        if (mounted) setLoadingUser(false)
      }
    }

    loadInitial()

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const nextUser = session?.user ?? null
        setUser(nextUser)
        if (nextUser) {
          await fetchUserProfile(nextUser.id)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  // Propaga erros do hook de perfil
  useEffect(() => {
    if (profileError) setError(profileError)
  }, [profileError])

  // Ações expostas
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
      return
    }
    setUser(null)
  }

  const refresh = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const nextUser = data.session?.user ?? null
      setUser(nextUser)
      if (nextUser) await fetchUserProfile(nextUser.id)
    } catch (e: any) {
      setError(e?.message || 'Erro ao atualizar sessão')
    }
  }

  const loading = useMemo(() => loadingUser || loadingProfile, [loadingUser, loadingProfile])

  const value = useMemo<AuthContextType>(() => ({
    user,
    profile: (profile as Profile) || null,
    loading,
    error,
    signIn,
    signOut,
    refresh,
  }), [user, profile, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- Hook ---
export function useAuth() {
  return useContext(AuthContext)
}
