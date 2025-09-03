import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

export type UserProfile = {
  id: string;
  user_id: string;
  role: "admin" | "ctr" | "parceiro" | "checkup";
  empresa_id?: string;
  nome: string;
  created_at?: string;
  updated_at?: string;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log('🔍 useUserProfile: Iniciando busca de perfil para userId:', userId);
    console.log('🔍 useUserProfile: Timestamp:', new Date().toISOString());
    
    if (!userId) {
      console.warn('⚠️ useUserProfile: userId vazio, limpando perfil');
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 useUserProfile: Executando query no Supabase...');
      console.log('🔍 useUserProfile: Supabase client status:', {
        hasClient: !!supabase,
        url: supabase.supabaseUrl?.substring(0, 30) + '...'
      });
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id,
          user_id,
          role,
          empresa_id,
          nome,
          created_at,
          updated_at
        `)
        .eq("user_id", userId)
        .single();

      console.log('🔍 useUserProfile: Query executada. Resultado:', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message
      });

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️ useUserProfile: Perfil não encontrado (PGRST116) para userId:', userId);
          setError(`Perfil não encontrado para o usuário. Entre em contato com o administrador.`);
        } else {
          console.error('❌ useUserProfile: Erro ao buscar perfil:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          setError(`Erro ao buscar perfil: ${error.message}`);
        }
        setProfile(null);
      } else {
        console.log('✅ useUserProfile: Perfil encontrado:', {
          id: data.id,
          role: data.role,
          nome: data.nome,
          empresa_id: data.empresa_id
        });
        setProfile(data);
        setError(null);
      }
    } catch (e: any) {
      console.error('❌ useUserProfile: Exceção inesperada ao buscar perfil:', e);
      console.error('❌ useUserProfile: Stack trace:', e.stack);
      setError(`Exceção ao buscar perfil: ${e?.message || 'Erro desconhecido'}`);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    console.log('🧹 useUserProfile: Limpando perfil');
    setProfile(null);
    setError(null);
    setLoading(false);
  }, []);

  return { 
    profile, 
    loading, 
    error, 
    fetchUserProfile,
    clearProfile
  };
}