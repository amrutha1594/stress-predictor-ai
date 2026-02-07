
-- Add user_id column to portfolio_analyses
ALTER TABLE public.portfolio_analyses
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Deny direct delete" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Deny direct insert" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Deny direct select" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Deny direct update" ON public.portfolio_analyses;

-- Create user-scoped SELECT policy (authenticated users can view their own analyses)
CREATE POLICY "Users can view their own analyses"
ON public.portfolio_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Keep INSERT/UPDATE/DELETE locked down (edge function uses service role)
CREATE POLICY "Deny direct insert"
ON public.portfolio_analyses
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Deny direct update"
ON public.portfolio_analyses
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Deny direct delete"
ON public.portfolio_analyses
FOR DELETE
TO public
USING (false);
