import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Erro ao obter sessão')
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        if (!mounted) return
        console.error('Auth initialization error:', err)
        setError('Erro ao inicializar autenticação')
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found
          setError('Perfil de usuário não encontrado')
        } else {
          console.error('Error fetching user profile:', error)
          setError('Erro ao buscar perfil do usuário')
        }
        setProfile(null)
      } else {
        setProfile(data)
        setError(null)
      }
    } catch (err) {
      console.error('Fetch profile error:', err)
      setError('Erro ao buscar perfil do usuário')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setError(error.message)
        return { error }
      }
      
      return { error: null }
    } catch (err) {
      const errorMessage = 'Erro ao fazer login'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return { error }
      }
      
      // Clear local state
      setUser(null)
      setProfile(null)
      
      return { error: null }
    } catch (err) {
      const errorMessage = 'Erro ao fazer logout'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

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