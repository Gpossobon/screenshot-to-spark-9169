CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(auth.uid(), 'admin') $$;

CREATE TABLE public.captain_requests (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by uuid
);
GRANT SELECT ON public.captain_requests TO authenticated;
GRANT ALL ON public.captain_requests TO service_role;
ALTER TABLE public.captain_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own captain request" ON public.captain_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Participant answers "Você é o capitão?". Yes opens (or reopens) a pending
-- request; No withdraws a pending one. Approved requests are not changed here.
-- Returns the resulting status (null when there is no request).
CREATE OR REPLACE FUNCTION public.set_captain_request(p_wants boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid(); v_status text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  SELECT status INTO v_status FROM public.captain_requests WHERE user_id = v_uid;
  IF v_status = 'approved' THEN RETURN 'approved'; END IF;
  IF p_wants THEN
    IF v_status IS DISTINCT FROM 'pending' THEN
      INSERT INTO public.captain_requests (user_id, status) VALUES (v_uid, 'pending')
      ON CONFLICT (user_id) DO UPDATE SET status = 'pending', created_at = now(), decided_at = NULL, decided_by = NULL;
    END IF;
    RETURN 'pending';
  END IF;
  IF v_status = 'pending' THEN DELETE FROM public.captain_requests WHERE user_id = v_uid; RETURN NULL; END IF;
  RETURN v_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_captain_requests()
RETURNS TABLE (user_id uuid, full_name text, ra text, campus text, turma text, email text, status text, created_at timestamptz, decided_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'NOT_ADMIN'; END IF;
  RETURN QUERY
    SELECT r.user_id, coalesce(p.full_name, ''), coalesce(p.ra, ''), coalesce(p.campus, ''), coalesce(p.turma, ''),
           coalesce(u.email::text, ''), r.status, r.created_at, r.decided_at
    FROM public.captain_requests r
    LEFT JOIN public.academic_profiles p ON p.user_id = r.user_id
    LEFT JOIN auth.users u ON u.id = r.user_id
    ORDER BY (r.status = 'pending') DESC, r.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_captain_request(p_user_id uuid, p_approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'NOT_ADMIN'; END IF;
  UPDATE public.captain_requests
    SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END, decided_at = now(), decided_by = auth.uid()
    WHERE user_id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'REQUEST_NOT_FOUND'; END IF;
END;
$$;

-- Only approved captains may create a team.
CREATE OR REPLACE FUNCTION public.create_my_team()
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid(); v_team uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.academic_profiles WHERE user_id = v_uid) THEN
    RAISE EXCEPTION 'PROFILE_INCOMPLETE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.captain_requests WHERE user_id = v_uid AND status = 'approved') THEN
    RAISE EXCEPTION 'CAPTAIN_NOT_APPROVED';
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_uid) THEN
    RAISE EXCEPTION 'ALREADY_IN_TEAM';
  END IF;
  INSERT INTO public.teams (captain_id) VALUES (v_uid) RETURNING id INTO v_team;
  INSERT INTO public.team_members (team_id, user_id, role) VALUES (v_team, v_uid, 'captain');
  RETURN v_team;
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_captain_request(boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_captain_requests() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.decide_captain_request(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_my_team() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_captain_request(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_captain_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_captain_request(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_my_team() TO authenticated;