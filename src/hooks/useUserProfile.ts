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
    
    if (!userId) {
      console.warn('⚠️ useUserProfile: userId vazio, limpando perfil');
    }
    if (!userId) {
      console.log('⚠️ useUserProfile: userId vazio, limpando perfil')
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 useUserProfile: Executando query no Supabase...');
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️ useUserProfile: Perfil não encontrado (PGRST116) para userId:', userId);
          setError(`Perfil não encontrado para o usuário ${userId}. Verifique se o perfil foi criado no banco de dados.`);
        } else {
          console.error('❌ useUserProfile: Erro ao buscar perfil:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
          setError(`Erro ao buscar perfil: ${error.message}`);
        }
        setProfile(null);
      } else {
        console.log('✅ useUserProfile: Perfil encontrado:', data);
        setProfile(data);
        setError(null);
      }
    } catch (e: any) {
      console.error('❌ useUserProfile: Exceção inesperada ao buscar perfil:', e);
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