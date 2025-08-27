import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting user:', error)
        setLoading(false)
        return
      }
      
      setUser(user)

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error getting profile:', profileError)
        }
        
        setProfile(profile)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting profile:', profileError)
          }
          
          setProfile(profile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin: profile?.role === 'admin',
    isCTR: profile?.role === 'ctr',
    isParceiro: profile?.role === 'parceiro',
    isCheckup: profile?.role === 'checkup'
  }
}