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
        console.log('Initializing auth...')
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Erro ao obter sessão')
          setLoading(false)
          return
        }

        console.log('Session:', session?.user?.id ? 'Found' : 'Not found')
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state change:', event, session?.user?.id ? 'User found' : 'No user')
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Reset error when user logs in
          setError(null)
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          setError(null)
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
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        
      if (error) {
        console.error('Profile fetch error:', error)
        
        if (error.code === 'PGRST116') {
          // Profile not found - this is a critical error
          console.error('Profile not found for user:', userId)
          setError('Perfil de usuário não encontrado. Entre em contato com o administrador.')
          setProfile(null)
        } else {
          console.error('Error fetching user profile:', error)
          setError('Erro ao buscar perfil do usuário')
          setProfile(null)
        }
      } else {
        console.log('Profile found:', data?.role)
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
      setLoading(true)
      
      console.log('Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        setError(error.message)
        setLoading(false)
        return { error }
      }
      
      console.log('Sign in successful, user:', data.user?.id)
      
      // Don't set loading to false here - let the auth state change handle it
      return { error: null }
    } catch (err) {
      console.error('Sign in exception:', err)
      const errorMessage = 'Erro ao fazer login'
      setError(errorMessage)
      setLoading(false)
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