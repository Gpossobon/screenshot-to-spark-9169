import { queryOptions } from "@tanstack/react-query";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { fbAuth, fbDb } from "@/integrations/firebase/client";

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
      const snap = await getDoc(doc(fbDb(), "captainRequests", userId));
      return snap.exists() ? ((snap.data().status as CaptainStatus) ?? null) : null;
    },
  });

/** Saves the "Você é o capitão?" answer and returns the resulting status. */
export async function setCaptainRequest(wants: boolean): Promise<CaptainStatus> {
  const user = fbAuth().currentUser;
  if (!user) throw new Error("NOT_AUTHENTICATED");
  const ref = doc(fbDb(), "captainRequests", user.uid);
  const current = await getDoc(ref);
  const status = current.exists() ? (current.data().status as CaptainStatus) : null;
  if (status === "approved") return status;
  if (!wants) {
    if (current.exists()) await deleteDoc(ref);
    return null;
  }
  if (status === "pending") return status;
  const profile = (await getDoc(doc(fbDb(), "profiles", user.uid))).data() ?? {};
  await setDoc(ref, {
    status: "pending",
    email: user.email ?? "",
    full_name: profile.full_name ?? "",
    ra: profile.ra ?? "",
    campus: profile.campus ?? "",
    turma: profile.turma ?? "",
    created_at: new Date().toISOString(),
  });
  return "pending";
}

export const isAdminQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["is-admin", userId] as const,
    queryFn: async () => {
      const snap = await getDoc(doc(fbDb(), "admins", userId));
      return snap.exists();
    },
  });

export type CaptainRequestRow = {
  user_id: string;
  status: Exclude<CaptainStatus, null>;
  email: string;
  full_name: string;
  ra: string;
  campus: string;
  turma: string;
  created_at: string;
};

export const captainRequestsKey = ["captain-requests"] as const;

export const captainRequestsQueryOptions = () =>
  queryOptions({
    queryKey: captainRequestsKey,
    queryFn: async (): Promise<CaptainRequestRow[]> => {
      const snap = await getDocs(collection(fbDb(), "captainRequests"));
      return snap.docs
        .map((d) => ({ user_id: d.id, ...(d.data() as Omit<CaptainRequestRow, "user_id">) }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });

export async function decideCaptainRequest(userId: string, approve: boolean) {
  await updateDoc(doc(fbDb(), "captainRequests", userId), {
    status: approve ? "approved" : "rejected",
  });
}
