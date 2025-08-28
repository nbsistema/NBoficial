import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { User } from "@supabase/supabase-js"
import { useUserProfile } from "../hooks/useUserProfile"

type AuthContextType = {
  user: User | null
  loadingUser: boolean
  loadingProfile: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loadingUser: true,
  loadingProfile: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const { fetchUserProfile, loading: loadingProfile } = useUserProfile()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      console.log("🔧 useAuth: Verificando sessão inicial...")
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return
      if (error) {
        console.error("❌ Erro ao buscar sessão inicial:", error.message)
        setUser(null)
        setLoadingUser(false)
        return
      }

      const session = data.session
      console.log(
        "🔧 useAuth: Status da sessão:",
        session?.user?.id ? "Usuário encontrado" : "Sem usuário"
      )
      setUser(session?.user ?? null)

      if (session?.user) {
        console.log("🔧 useAuth: Buscando perfil do usuário:", session.user.id)
        await fetchUserProfile(session.user.id)
      }

      setLoadingUser(false)
    }

    loadUser()

    // Listener para mudanças de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Evento de auth:", event)

        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  return (
    <AuthContext.Provider value={{ user, loadingUser, loadingProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
