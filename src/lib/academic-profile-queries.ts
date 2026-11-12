import { queryOptions } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { fbDb } from "@/integrations/firebase/client";
import type { AcademicProfileInput } from "./academic-profile";

export const academicProfileKey = (userId: string) => ["academic-profile", userId] as const;

export type AcademicProfileRow = { full_name: string; ra: string; campus: string; turma: string };

/** The signed-in user's saved academic data (rules limit writes to their own document). */
export const academicProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: academicProfileKey(userId),
    queryFn: async (): Promise<AcademicProfileRow | null> => {
      const snap = await getDoc(doc(fbDb(), "profiles", userId));
      if (!snap.exists()) return null;
      const d = snap.data();
      return { full_name: d.full_name ?? "", ra: d.ra ?? "", campus: d.campus ?? "", turma: d.turma ?? "" };
    },
  });

export async function saveAcademicProfile(userId: string, values: AcademicProfileInput) {
  const ref = doc(fbDb(), "profiles", userId);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...values,
      full_name_lower: values.full_name.trim().toLowerCase(),
      ...(existing.exists() ? {} : { teamId: null }),
    },
    { merge: true },
  );
  const { full_name, ra, campus, turma } = values;
  return { full_name, ra, campus, turma } as AcademicProfileRow;
}
