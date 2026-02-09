-- Allow anonymous analyses by making user_id nullable
ALTER TABLE public.portfolio_analyses ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies that require auth
DROP POLICY IF EXISTS "Users can view own analyses" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.portfolio_analyses;

-- Create a permissive SELECT policy for everyone
CREATE POLICY "Anyone can view analyses"
  ON public.portfolio_analyses
  FOR SELECT
  USING (true);

-- Allow the service role to insert (edge function uses service role key)
-- No INSERT policy needed since service role bypasses RLS