
-- Clean up any records with NULL user_id (no ownership = no accountability)
DELETE FROM public.portfolio_analyses WHERE user_id IS NULL;

-- Drop all existing RLS policies to rebuild properly
DROP POLICY IF EXISTS "Deny direct delete" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Deny direct insert" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Deny direct update" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.portfolio_analyses;

-- Make user_id NOT NULL (FK to auth.users already exists)
ALTER TABLE public.portfolio_analyses 
  ALTER COLUMN user_id SET NOT NULL;

-- PERMISSIVE policies for authenticated users to access their own data only
CREATE POLICY "Users can view their own analyses"
ON public.portfolio_analyses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.portfolio_analyses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- No INSERT/UPDATE policies — edge function uses service role key (bypasses RLS)
-- This means no client can directly insert or update records.
