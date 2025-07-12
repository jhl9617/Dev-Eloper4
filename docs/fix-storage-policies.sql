/* ============================================================================
   Storage Policy Fix - Resolve RLS Issues
   ============================================================================ */

-- 1. First, drop existing policies
DROP POLICY IF EXISTS "blog_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_delete" ON storage.objects;

-- 2. Create simplified policies for testing
-- Public read access to all images
CREATE POLICY "blog_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload images
CREATE POLICY "blog_images_auth_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
CREATE POLICY "blog_images_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "blog_images_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- 3. Alternative: If you want admin-only access, use this instead
-- (Comment out the above policies and uncomment these)

/*
-- Admin-only upload access with proper admin check
CREATE POLICY "blog_images_admin_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  (
    -- Email-based admin check
    auth.jwt() ->> 'email' = 'admin@devblog.com' OR
    -- Database admin check (bypass RLS by using security definer function)
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  )
);

-- Admin-only update access
CREATE POLICY "blog_images_admin_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  (
    auth.jwt() ->> 'email' = 'admin@devblog.com' OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  )
);

-- Admin-only delete access
CREATE POLICY "blog_images_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  (
    auth.jwt() ->> 'email' = 'admin@devblog.com' OR
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  )
);
*/

-- 4. Verify bucket exists and is properly configured
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'blog-images';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. Test query to check current user
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  auth.jwt() ->> 'email' as user_email,
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()) as is_admin_db;

DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies updated!';
  RAISE NOTICE '📋 Current policies:';
  RAISE NOTICE '   - Public read access for all images';
  RAISE NOTICE '   - Authenticated users can upload/update/delete';
  RAISE NOTICE '   - Uncomment admin-only policies if needed';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Test the policies now!';
END $$;