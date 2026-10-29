<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Auth screens share `src/components/auth/AuthLayout.tsx` (header, visual panel, institutional footer) so all screens stay consistent.
- Password/email rules and auth error translation live in `src/lib/auth-validation.ts` (covered by its test) — single source for every form.
- Brand images are CDN asset pointers in `src/assets/*.asset.json`; never replace them with generated images.
- Auth screens fill the viewport via the `min-h-viewport` utility (100vh → 100dvh) and tighten spacing with the `short:` variant (max-height 720px); use `size="auth"` buttons there — keeps login visible without scrolling while longer forms can still scroll.
- On desktop (`lg`) the auth shell is exactly `h-viewport` and only the form column scrolls; `AuthVisualPanel` never depends on form height — keeps header and mascot in the identical spot on every auth screen.
- Signed-in pages live under `src/routes/_authenticated/` (client-only gate, redirects to `/`); `/painel` and `/minha-equipe` (the post-login landing page) send users without complete academic data to `/completar-cadastro` — one place enforces the onboarding step.
- Academic data rules live in `src/lib/academic-profile.ts` (covered by its test); reads/writes go through `academic-profile-queries.ts` with the browser client, protected by own-row RLS.
- Teams (`/minha-equipe`) are read and changed only through security-definer database functions (`get_my_team`, `create_my_team`, `search_participants`, `add_team_member`, `remove_team_member`); the tables have no direct client access, so team-size, captain-only and one-team-per-person rules live in one place. Page-side mirrors of those rules are in `src/lib/team-rules.ts` (covered by its test).
