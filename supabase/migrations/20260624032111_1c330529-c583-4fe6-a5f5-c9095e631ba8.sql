
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='calculation_runs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calculation_runs;
  END IF;
END $$;
