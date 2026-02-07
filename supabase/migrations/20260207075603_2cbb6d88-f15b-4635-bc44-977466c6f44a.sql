-- Remove unused public storage bucket and its permissive policies
DROP POLICY IF EXISTS "Portfolio files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload portfolio files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete portfolio files" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'portfolios';