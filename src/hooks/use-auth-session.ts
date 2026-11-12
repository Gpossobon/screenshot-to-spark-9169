import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { fbAuth } from "@/integrations/firebase/client";
import { toAppUser, type AppSession } from "@/lib/firebase-auth";

/** Current auth session; `loading` is true until the first check finishes. */
export function useAuthSession() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(fbAuth(), (u) => {
      setSession(u && u.emailVerified ? { user: toAppUser(u) } : null);
      setLoading(false);
    });
  }, []);

  return { session, loading };
}
