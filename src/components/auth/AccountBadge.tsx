import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Discreet signed-in identity for the header, with a sign-out action. */
export function AccountBadge({ email }: { email: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-muted-foreground sm:flex">
        <UserRound aria-hidden="true" className="size-4 shrink-0 text-brand" />
        <span className="truncate" title={email}>
          {email}
        </span>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-bold text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut aria-hidden="true" className="size-4" />
        Sair
      </button>
    </div>
  );
}
