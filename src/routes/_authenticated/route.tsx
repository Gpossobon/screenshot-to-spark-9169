import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/firebase-auth";

// Signed-in area. The session lives in the browser, so this gate runs client-side
// only; signed-out visitors go back to the login page ("/").
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: "/", replace: true });
    return { user };
  },
  component: () => <Outlet />,
});
