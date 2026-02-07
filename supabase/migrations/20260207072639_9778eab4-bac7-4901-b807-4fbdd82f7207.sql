
-- Drop all existing overly permissive RLS policies
DROP POLICY IF EXISTS "Anyone can create analyses" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Anyone can delete analyses" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Anyone can update analyses" ON public.portfolio_analyses;
DROP POLICY IF EXISTS "Anyone can view analyses" ON public.portfolio_analyses;

-- Deny all direct client access. 
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- and the client receives results via the edge function response (router state),
-- so no direct table access is needed.
CREATE POLICY "Deny direct select"
  ON public.portfolio_analyses FOR SELECT
  USING (false);

CREATE POLICY "Deny direct insert"
  ON public.portfolio_analyses FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Deny direct update"
  ON public.portfolio_analyses FOR UPDATE
  USING (false);

CREATE POLICY "Deny direct delete"
  ON public.portfolio_analyses FOR DELETE
  USING (false);
