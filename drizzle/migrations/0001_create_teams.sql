CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  captain_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

GRANT ALL ON public.teams TO service_role;
GRANT ALL ON public.team_members TO service_role;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
-- No direct table policies: signed-in users reach teams only through the
-- security-definer functions below, which enforce every team rule.

-- Caller's team with members (name + RA). Empty when the caller has no team.
CREATE OR REPLACE FUNCTION public.get_my_team()
RETURNS TABLE (team_id uuid, user_id uuid, full_name text, ra text, role text, joined_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT m.team_id, m.user_id, coalesce(p.full_name, ''), coalesce(p.ra, ''), m.role, m.joined_at
  FROM public.team_members m
  LEFT JOIN public.academic_profiles p ON p.user_id = m.user_id
  WHERE m.team_id = (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  ORDER BY (m.role = 'captain') DESC, m.joined_at;
$$;

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
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_uid) THEN
    RAISE EXCEPTION 'ALREADY_IN_TEAM';
  END IF;
  INSERT INTO public.teams (captain_id) VALUES (v_uid) RETURNING id INTO v_team;
  INSERT INTO public.team_members (team_id, user_id, role) VALUES (v_team, v_uid, 'captain');
  RETURN v_team;
END;
$$;

-- Captain-only search over participants with academic data.
CREATE OR REPLACE FUNCTION public.search_participants(p_query text)
RETURNS TABLE (user_id uuid, full_name text, ra text, in_team boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_q text := trim(coalesce(p_query, ''));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.teams WHERE captain_id = auth.uid()) THEN
    RAISE EXCEPTION 'NOT_CAPTAIN';
  END IF;
  IF length(v_q) < 2 THEN RETURN; END IF;
  RETURN QUERY
    SELECT p.user_id, p.full_name, p.ra,
           EXISTS (SELECT 1 FROM public.team_members m WHERE m.user_id = p.user_id)
    FROM public.academic_profiles p
    WHERE p.user_id <> auth.uid()
      AND (p.full_name ILIKE '%' || v_q || '%' OR p.ra ILIKE '%' || v_q || '%')
    ORDER BY p.full_name
    LIMIT 10;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_team_member(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE captain_id = auth.uid() FOR UPDATE;
  IF v_team IS NULL THEN RAISE EXCEPTION 'NOT_CAPTAIN'; END IF;
  IF p_user_id = auth.uid() THEN RAISE EXCEPTION 'IS_CAPTAIN'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.academic_profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'PARTICIPANT_NOT_FOUND';
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = p_user_id AND team_id = v_team) THEN
    RAISE EXCEPTION 'ALREADY_MEMBER';
  END IF;
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'ALREADY_IN_TEAM';
  END IF;
  IF (SELECT count(*) FROM public.team_members WHERE team_id = v_team) >= 5 THEN
    RAISE EXCEPTION 'TEAM_FULL';
  END IF;
  INSERT INTO public.team_members (team_id, user_id, role) VALUES (v_team, p_user_id, 'member');
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_team_member(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_team uuid;
BEGIN
  SELECT id INTO v_team FROM public.teams WHERE captain_id = auth.uid();
  IF v_team IS NULL THEN RAISE EXCEPTION 'NOT_CAPTAIN'; END IF;
  IF p_user_id = auth.uid() THEN RAISE EXCEPTION 'IS_CAPTAIN'; END IF;
  DELETE FROM public.team_members WHERE team_id = v_team AND user_id = p_user_id AND role = 'member';
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_team() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_my_team() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.search_participants(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.add_team_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.remove_team_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_my_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_participants(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_team_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_team_member(uuid) TO authenticated;