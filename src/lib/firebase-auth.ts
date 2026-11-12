import type { User } from "firebase/auth";
import { fbAuth } from "@/integrations/firebase/client";

export type AppUser = {
  id: string;
  email: string;
  user_metadata: { full_name?: string; name?: string };
};
export type AppSession = { user: AppUser };

export function toAppUser(u: User): AppUser {
  return { id: u.uid, email: u.email ?? "", user_metadata: { full_name: u.displayName ?? undefined } };
}

/** Signed-in, e-mail-confirmed user, waiting for Firebase to restore the session. */
export async function getCurrentUser(): Promise<AppUser | null> {
  const auth = fbAuth();
  await auth.authStateReady();
  const u = auth.currentUser;
  return u && u.emailVerified ? toAppUser(u) : null;
}

export async function signOutUser() {
  const { signOut } = await import("firebase/auth");
  await signOut(fbAuth());
}
