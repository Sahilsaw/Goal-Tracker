-- Create the day_goals table for shared boards
CREATE TABLE IF NOT EXISTS public.day_goals (
  slug TEXT NOT NULL,
  date TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (slug, date)
);

-- Allow anonymous read/write (anyone with the link can view and edit)
ALTER TABLE public.day_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read"
  ON public.day_goals
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert"
  ON public.day_goals
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update"
  ON public.day_goals
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete"
  ON public.day_goals
  FOR DELETE
  TO anon
  USING (true);
