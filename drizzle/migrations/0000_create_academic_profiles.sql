CREATE TABLE public.academic_profiles (
  user_id uuid PRIMARY KEY,
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100),
  ra text NOT NULL CHECK (char_length(btrim(ra)) BETWEEN 1 AND 50),
  campus text NOT NULL CHECK (char_length(btrim(campus)) BETWEEN 1 AND 100),
  turma text NOT NULL CHECK (char_length(btrim(turma)) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.academic_profiles TO authenticated;
GRANT ALL ON public.academic_profiles TO service_role;

ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own academic profile"
  ON public.academic_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own academic profile"
  ON public.academic_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own academic profile"
  ON public.academic_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER academic_profiles_set_updated_at
  BEFORE UPDATE ON public.academic_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();