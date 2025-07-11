/* ============================================================================
   Storage Setup for Dev-Eloper4 Blog
   ============================================================================
   
   This file sets up Supabase Storage buckets and policies for the blog.
   Run this after the main database setup.
   
   ============================================================================ */

/* ============================================================================
   1. Storage Buckets
   ============================================================================ */

-- Create blog-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

/* ============================================================================
   2. Storage Policies
   ============================================================================ */

-- Public read access to all images
CREATE POLICY IF NOT EXISTS "blog_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Admin upload access
CREATE POLICY IF NOT EXISTS "blog_images_admin_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  (
    -- Check if user is admin (email-based for now)
    auth.jwt() ->> 'email' = 'admin@devblog.com' OR
    -- Or use database admin check if available
    (SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  )
);

-- Admin update access
CREATE POLICY IF NOT EXISTS "blog_images_admin_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  (
    auth.jwt() ->> 'email' = 'admin@devblog.com' OR
    (SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  )
);

-- Admin delete access
CREATE POLICY IF NOT EXISTS "blog_images_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  (
    auth.jwt() ->> 'email' = 'admin@devblog.com' OR
    (SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))
  )
);

/* ============================================================================
   3. Completion Notice
   ============================================================================ */

DO $$
BEGIN
  RAISE NOTICE '✅ Storage setup completed!';
  RAISE NOTICE '📁 Created bucket: blog-images';
  RAISE NOTICE '🔐 Storage policies configured for admin access';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Notes:';
  RAISE NOTICE '   - Images are publicly readable';
  RAISE NOTICE '   - Only admins can upload/modify images';
  RAISE NOTICE '   - 50MB file size limit';
  RAISE NOTICE '   - Supported formats: JPEG, PNG, GIF, WebP';
END $$;