import { useEffect, useState } from "react";
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

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}
