import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Signed-in area. The session lives in the browser, so this gate runs client-side
// only; signed-out visitors go back to the login page ("/").
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/", replace: true });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
