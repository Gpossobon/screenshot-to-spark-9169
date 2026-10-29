import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TeamMember = {
  team_id: string;
  user_id: string;
  full_name: string;
  ra: string;
  role: string;
  joined_at: string;
};

export const myTeamKey = (userId: string) => ["my-team", userId] as const;

/** Caller's team and members; empty list when the caller has no team. */
export const myTeamQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: myTeamKey(userId),
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase.rpc("get_my_team");
      if (error) throw error;
      return data ?? [];
    },
  });

export const participantSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ["participant-search", query] as const,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_participants", { p_query: query });
      if (error) throw error;
      return data ?? [];
    },
    enabled: query.trim().length >= 2,
    staleTime: 10_000,
  });

export async function createMyTeam() {
  const { error } = await supabase.rpc("create_my_team");
  if (error) throw error;
}

export async function addTeamMember(userId: string) {
  const { error } = await supabase.rpc("add_team_member", { p_user_id: userId });
  if (error) throw error;
}

export async function removeTeamMember(userId: string) {
  const { error } = await supabase.rpc("remove_team_member", { p_user_id: userId });
  if (error) throw error;
}
