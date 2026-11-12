import { queryOptions } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { fbAuth, fbDb } from "@/integrations/firebase/client";
import { MAX_TEAM_SIZE } from "./team-rules";

export type TeamMember = {
  team_id: string;
  user_id: string;
  full_name: string;
  ra: string;
  role: string;
  joined_at: string;
};

type StoredMember = Omit<TeamMember, "team_id">;

export const myTeamKey = (userId: string) => ["my-team", userId] as const;

function me() {
  const u = fbAuth().currentUser;
  if (!u) throw new Error("NOT_AUTHENTICATED");
  return u.uid;
}

/** Caller's team and members; empty list when the caller has no team. */
export const myTeamQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: myTeamKey(userId),
    queryFn: async (): Promise<TeamMember[]> => {
      const db = fbDb();
      const profile = await getDoc(doc(db, "profiles", userId));
      const teamId = profile.exists() ? (profile.data().teamId as string | null) : null;
      if (!teamId) return [];
      const team = await getDoc(doc(db, "teams", teamId));
      if (!team.exists()) return [];
      const members = (team.data().members ?? []) as StoredMember[];
      return members.map((m) => ({ ...m, team_id: teamId }));
    },
  });

export type ParticipantResult = { user_id: string; full_name: string; ra: string; in_team: boolean };

export const participantSearchQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["participant-search", q] as const,
    queryFn: async (): Promise<ParticipantResult[]> => {
      const term = q.trim().toLowerCase();
      const snap = await getDocs(
        query(
          collection(fbDb(), "profiles"),
          where("full_name_lower", ">=", term),
          where("full_name_lower", "<=", term + "\uf8ff"),
          orderBy("full_name_lower"),
          limit(10),
        ),
      );
      const self = fbAuth().currentUser?.uid;
      return snap.docs
        .filter((d) => d.id !== self)
        .map((d) => ({
          user_id: d.id,
          full_name: d.data().full_name ?? "",
          ra: d.data().ra ?? "",
          in_team: !!d.data().teamId,
        }));
    },
    enabled: q.trim().length >= 2,
    staleTime: 10_000,
  });

export async function createMyTeam() {
  const uid = me();
  const db = fbDb();
  await runTransaction(db, async (tx) => {
    const profileRef = doc(db, "profiles", uid);
    const profile = await tx.get(profileRef);
    const request = await tx.get(doc(db, "captainRequests", uid));
    if (!profile.exists() || !profile.data().ra) throw new Error("PROFILE_INCOMPLETE");
    if (profile.data().teamId) throw new Error("ALREADY_IN_TEAM");
    if (!request.exists() || request.data().status !== "approved")
      throw new Error("CAPTAIN_NOT_APPROVED");
    const p = profile.data();
    tx.set(doc(db, "teams", uid), {
      captainId: uid,
      memberIds: [uid],
      members: [
        { user_id: uid, full_name: p.full_name, ra: p.ra, role: "captain", joined_at: new Date().toISOString() },
      ],
    });
    tx.update(profileRef, { teamId: uid });
  });
}

export async function addTeamMember(userId: string) {
  const uid = me();
  const db = fbDb();
  await runTransaction(db, async (tx) => {
    const teamRef = doc(db, "teams", uid);
    const profileRef = doc(db, "profiles", userId);
    const team = await tx.get(teamRef);
    const profile = await tx.get(profileRef);
    if (!team.exists()) throw new Error("NOT_CAPTAIN");
    if (!profile.exists()) throw new Error("PARTICIPANT_NOT_FOUND");
    const ids = team.data().memberIds as string[];
    if (userId === uid) throw new Error("IS_CAPTAIN");
    if (ids.includes(userId)) throw new Error("ALREADY_MEMBER");
    if (profile.data().teamId) throw new Error("ALREADY_IN_TEAM");
    if (ids.length >= MAX_TEAM_SIZE) throw new Error("TEAM_FULL");
    const p = profile.data();
    tx.update(teamRef, {
      memberIds: [...ids, userId],
      members: [
        ...(team.data().members as StoredMember[]),
        { user_id: userId, full_name: p.full_name, ra: p.ra, role: "member", joined_at: new Date().toISOString() },
      ],
    });
    tx.update(profileRef, { teamId: uid });
  });
}

export async function removeTeamMember(userId: string) {
  const uid = me();
  const db = fbDb();
  if (userId === uid) throw new Error("IS_CAPTAIN");
  await runTransaction(db, async (tx) => {
    const teamRef = doc(db, "teams", uid);
    const team = await tx.get(teamRef);
    if (!team.exists()) throw new Error("NOT_CAPTAIN");
    tx.update(teamRef, {
      memberIds: (team.data().memberIds as string[]).filter((id) => id !== userId),
      members: (team.data().members as StoredMember[]).filter((m) => m.user_id !== userId),
    });
    tx.update(doc(db, "profiles", userId), { teamId: null });
  });
}
