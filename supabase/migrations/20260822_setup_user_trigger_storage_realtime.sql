-- Migration: setup_user_trigger_storage_realtime
-- Applied via Supabase MCP on 2026-08-22

-- 1. Automated New User Workspace Provisioning Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_ws_id uuid;
  user_display_name text;
  user_slug text;
BEGIN
  -- Extract user display name from auth metadata or email
  user_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'Personal'
  );

  user_slug := lower(regexp_replace(user_display_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new.id::text, 1, 6);

  -- 1. Create default personal workspace
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES (user_display_name || '''s Workspace', user_slug, new.id)
  RETURNING id INTO new_ws_id;

  -- 2. Add as Owner in workspace_members
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_ws_id, new.id, 'owner');

  -- 3. Initialize Free Subscription
  INSERT INTO public.subscriptions (
    workspace_id,
    tier,
    status,
    ai_generation_quota,
    ai_generations_used,
    connected_accounts_limit,
    scheduled_posts_limit
  )
  VALUES (new_ws_id, 'free', 'active', 20, 0, 2, 30);

  -- 4. Create default Free AI Provider Config
  INSERT INTO public.ai_provider_configs (
    workspace_id,
    user_id,
    provider_type,
    display_name,
    default_model,
    is_default,
    is_active
  )
  VALUES (
    new_ws_id,
    new.id,
    'free_default',
    'SocialHub Free Tier',
    'SocialHub AI Core v1',
    true,
    true
  );

  -- 5. Create default Brand Voice
  INSERT INTO public.brand_voices (
    workspace_id,
    name,
    tone,
    is_default
  )
  VALUES (
    new_ws_id,
    'Default Brand Voice',
    'Professional, engaging, and clear',
    true
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Storage Buckets (post-media, avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('post-media', 'post-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Media Access" ON storage.objects;
CREATE POLICY "Public Media Access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('post-media', 'avatars'));

DROP POLICY IF EXISTS "Authenticated User Media Upload" ON storage.objects;
CREATE POLICY "Authenticated User Media Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('post-media', 'avatars')
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated User Media Update" ON storage.objects;
CREATE POLICY "Authenticated User Media Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('post-media', 'avatars')
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated User Media Delete" ON storage.objects;
CREATE POLICY "Authenticated User Media Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('post-media', 'avatars')
    AND auth.role() = 'authenticated'
  );

-- 3. Enable Realtime on messages, notifications, posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
