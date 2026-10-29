import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CaptainStatus = "pending" | "approved" | "rejected" | null;

/** Only an approved request lets a participant create a team. */
export function canCreateTeam(status: CaptainStatus): boolean {
  return status === "approved";
}

export const CAPTAIN_STATUS_LABEL: Record<Exclude<CaptainStatus, null>, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
};

export const myCaptainStatusKey = (userId: string) => ["captain-status", userId] as const;

export const myCaptainStatusQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: myCaptainStatusKey(userId),
    queryFn: async (): Promise<CaptainStatus> => {
      const { data, error } = await supabase
        .from("captain_requests")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data?.status as CaptainStatus) ?? null;
    },
  });

/** Saves the "Você é o capitão?" answer and returns the resulting status. */
export async function setCaptainRequest(wants: boolean): Promise<CaptainStatus> {
  const { data, error } = await supabase.rpc("set_captain_request", { p_wants: wants });
  if (error) throw error;
  return (data as CaptainStatus) ?? null;
}

export const isAdminQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["is-admin", userId] as const,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return data === true;
    },
  });

export const captainRequestsKey = ["captain-requests"] as const;

export const captainRequestsQueryOptions = () =>
  queryOptions({
    queryKey: captainRequestsKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_captain_requests");
      if (error) throw error;
      return data ?? [];
    },
  });

export async function decideCaptainRequest(userId: string, approve: boolean) {
  const { error } = await supabase.rpc("decide_captain_request", {
    p_user_id: userId,
    p_approve: approve,
  });
  if (error) throw error;
}
