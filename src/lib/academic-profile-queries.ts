import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AcademicProfileInput } from "./academic-profile";

export const academicProfileKey = (userId: string) => ["academic-profile", userId] as const;

/** The signed-in user's saved academic data (RLS limits reads to their own row). */
export const academicProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: academicProfileKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_profiles")
        .select("full_name, ra, campus, turma")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export async function saveAcademicProfile(userId: string, values: AcademicProfileInput) {
  const { data, error } = await supabase
    .from("academic_profiles")
    .upsert({ user_id: userId, ...values }, { onConflict: "user_id" })
    .select("full_name, ra, campus, turma")
    .single();
  if (error) throw error;
  return data;
}
