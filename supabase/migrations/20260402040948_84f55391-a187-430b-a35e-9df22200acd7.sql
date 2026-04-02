
ALTER TABLE public.profiles ALTER COLUMN zip_code SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN zip_code DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN post_tax_monthly_income SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN post_tax_monthly_income DROP NOT NULL;
