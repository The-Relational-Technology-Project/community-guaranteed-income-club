
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.participant_status AS ENUM ('active', 'waitlisted', 'inactive');
CREATE TYPE public.employment_status AS ENUM ('employed', 'unemployed', 'freelance', 'part_time', 'student', 'retired', 'other');
CREATE TYPE public.run_status AS ENUM ('draft', 'finalized');
CREATE TYPE public.waitlist_status AS ENUM ('waiting', 'activated');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  venmo_handle TEXT,
  zelle_info TEXT,
  zip_code TEXT NOT NULL,
  post_tax_monthly_income NUMERIC NOT NULL,
  student_loan_payment NUMERIC DEFAULT 0,
  profession TEXT,
  employment_status public.employment_status DEFAULT 'employed',
  bio TEXT,
  photo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  participant_status public.participant_status DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile history (audit trail)
CREATE TABLE public.profile_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  changed_fields TEXT[] NOT NULL,
  old_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.profile_history ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles per security rules)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Calculation runs
CREATE TABLE public.calculation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_date DATE NOT NULL,
  average_income NUMERIC,
  total_pool NUMERIC,
  participant_count INTEGER,
  status public.run_status DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calculation_runs ENABLE ROW LEVEL SECURITY;

-- Transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.calculation_runs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC NOT NULL,
  venmo_deep_link TEXT,
  is_confirmed_sender BOOLEAN DEFAULT false,
  is_confirmed_receiver BOOLEAN DEFAULT false,
  confirmed_sender_at TIMESTAMPTZ,
  confirmed_receiver_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Waitlist
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  status public.waitlist_status DEFAULT 'waiting'
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ========== TRIGGERS ==========

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profile audit trail trigger
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_cols TEXT[] := '{}';
  old_vals JSONB := '{}';
  new_vals JSONB := '{}';
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    changed_cols := array_append(changed_cols, 'name');
    old_vals := old_vals || jsonb_build_object('name', OLD.name);
    new_vals := new_vals || jsonb_build_object('name', NEW.name);
  END IF;
  IF OLD.post_tax_monthly_income IS DISTINCT FROM NEW.post_tax_monthly_income THEN
    changed_cols := array_append(changed_cols, 'post_tax_monthly_income');
    old_vals := old_vals || jsonb_build_object('post_tax_monthly_income', OLD.post_tax_monthly_income);
    new_vals := new_vals || jsonb_build_object('post_tax_monthly_income', NEW.post_tax_monthly_income);
  END IF;
  IF OLD.student_loan_payment IS DISTINCT FROM NEW.student_loan_payment THEN
    changed_cols := array_append(changed_cols, 'student_loan_payment');
    old_vals := old_vals || jsonb_build_object('student_loan_payment', OLD.student_loan_payment);
    new_vals := new_vals || jsonb_build_object('student_loan_payment', NEW.student_loan_payment);
  END IF;
  IF OLD.venmo_handle IS DISTINCT FROM NEW.venmo_handle THEN
    changed_cols := array_append(changed_cols, 'venmo_handle');
    old_vals := old_vals || jsonb_build_object('venmo_handle', OLD.venmo_handle);
    new_vals := new_vals || jsonb_build_object('venmo_handle', NEW.venmo_handle);
  END IF;
  IF OLD.participant_status IS DISTINCT FROM NEW.participant_status THEN
    changed_cols := array_append(changed_cols, 'participant_status');
    old_vals := old_vals || jsonb_build_object('participant_status', OLD.participant_status);
    new_vals := new_vals || jsonb_build_object('participant_status', NEW.participant_status);
  END IF;
  IF OLD.bio IS DISTINCT FROM NEW.bio THEN
    changed_cols := array_append(changed_cols, 'bio');
    old_vals := old_vals || jsonb_build_object('bio', OLD.bio);
    new_vals := new_vals || jsonb_build_object('bio', NEW.bio);
  END IF;
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    changed_cols := array_append(changed_cols, 'phone');
    old_vals := old_vals || jsonb_build_object('phone', OLD.phone);
    new_vals := new_vals || jsonb_build_object('phone', NEW.phone);
  END IF;
  IF OLD.zip_code IS DISTINCT FROM NEW.zip_code THEN
    changed_cols := array_append(changed_cols, 'zip_code');
    old_vals := old_vals || jsonb_build_object('zip_code', OLD.zip_code);
    new_vals := new_vals || jsonb_build_object('zip_code', NEW.zip_code);
  END IF;
  IF OLD.employment_status IS DISTINCT FROM NEW.employment_status THEN
    changed_cols := array_append(changed_cols, 'employment_status');
    old_vals := old_vals || jsonb_build_object('employment_status', OLD.employment_status);
    new_vals := new_vals || jsonb_build_object('employment_status', NEW.employment_status);
  END IF;
  IF OLD.profession IS DISTINCT FROM NEW.profession THEN
    changed_cols := array_append(changed_cols, 'profession');
    old_vals := old_vals || jsonb_build_object('profession', OLD.profession);
    new_vals := new_vals || jsonb_build_object('profession', NEW.profession);
  END IF;

  IF array_length(changed_cols, 1) > 0 THEN
    INSERT INTO public.profile_history (profile_id, changed_fields, old_values, new_values, changed_by)
    VALUES (NEW.id, changed_cols, old_vals, new_vals, auth.uid());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

-- ========== RLS POLICIES ==========

-- Profiles: authenticated users can view roster (public fields), edit own profile
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for status changes)
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profile history: users see own, admins see all
CREATE POLICY "Users can view own history" ON public.profile_history
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all history" ON public.profile_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles: only admins manage, users can read own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Calculation runs: admins create, authenticated view
CREATE POLICY "Authenticated can view runs" ON public.calculation_runs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage runs" ON public.calculation_runs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Transactions: participants see own, admins see all
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Senders can confirm their transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (sender_id = auth.uid());

CREATE POLICY "Receivers can confirm their transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (receiver_id = auth.uid());

-- Waitlist: admins manage, users see own
CREATE POLICY "Users can view own waitlist" ON public.waitlist
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage waitlist" ON public.waitlist
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage: avatar policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
