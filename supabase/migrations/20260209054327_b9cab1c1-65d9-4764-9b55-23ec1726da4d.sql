-- Drop the old restrictive policies that still exist
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.portfolio_analyses;